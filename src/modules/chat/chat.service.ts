import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JWTTokensUtility } from '../auth/utils/jwt-token.util';
import { ITokenPayload } from '../auth/auth.interface';
import { WsException } from '@nestjs/websockets';
import { EntityManager, QueryBuilder } from '@mikro-orm/mysql';
import { Conversation } from './entities/conversation.entity';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { findOneOrFailNotFoundExceptionHandler } from '../../utils/exception-handler.util';
import { Message, MessageType } from './entities/message.entity';
import { ErrorCode, ErrorMessage } from 'src/common/exceptions/constants.exception';
import { ConversationParticipant } from './entities/participant.entity';
import { Loaded, wrap } from '@mikro-orm/core';
import { CustomForbiddenException } from 'src/common/exceptions/custom.exception';

@Injectable()
export class ChatService {
  constructor(
    private jwtService: JWTTokensUtility,
    private readonly em: EntityManager,
    private readonly userService: UserService,
  ) {}
  async saveMessage(
    sender: User,
    message: string,
    conversation: Conversation,
  ): Promise<Message> {
    const newMessage: Message = this.em.create(Message, {
      messageType: MessageType.MESSAGE,
      sender: sender.id,
      message,
      conversation: conversation.id,
    });

    console.log('newMessage ', newMessage);

    await this.em.persistAndFlush(newMessage);

    return newMessage;
  }

  /**
   * Create new conversation. Support 1-1 conversation only
   * @param participantIds
   * @returns
   */
  async createNewConversation(participantIds: number[]) {
    const getConversationByParticipants: Conversation =
      await this.getOneToOneConversationByParticipants(participantIds);

    if (getConversationByParticipants) {
      return getConversationByParticipants;
    }

    const conversation: Conversation = this.em.create(Conversation, {});

    const conversationParticipants: ConversationParticipant[] = [];

    // add participants to conversation
    for (const participantId of participantIds) {
      // participant existed or not
      const participant: User = await this.userService.getUserById(
        participantId,
      );

      // add participant to conversation
      conversationParticipants.push(
        this.em.create(ConversationParticipant, {
          conversation,
          participant,
        }),
      );
    }

    await this.em.persistAndFlush(conversationParticipants);

    console.log('conversation ', conversation);
    return conversation;
  }

  async retrieveUserFromSocket(socket: Socket): Promise<User> {
    const bearerToken: string = socket.handshake.auth.token
      ? socket.handshake.auth.token
      : socket.handshake.headers.authorization;
    if (bearerToken) {
      const [type, token] = bearerToken.split(' ') ?? [];

      console.log('token', token);

      const user: ITokenPayload = await this.jwtService.verifyAccessToken(
        token,
      );
      console.log('user ', user);
      if (user) {
        // return user;
        return await this.userService.getUserById(user.sub);
      }
    }

    socket.emit('exception', ErrorCode.UNAUTHORIZED);
    // throw new WsException('Unauthorized');
  }

  /**
   * Get conversation by participants. Only supports 1-1 conversation
   */
  async getOneToOneConversationByParticipants(
    participantIds: number[],
  ): Promise<Conversation> {
    const qb2: QueryBuilder<ConversationParticipant> = this.em
      .createQueryBuilder(ConversationParticipant, 'cp2')
      .select('cp2.conversation_id')
      .where({
        participant: this.em.getReference(User, participantIds[1]),
      });

    const qb1: QueryBuilder<ConversationParticipant> = this.em
      .createQueryBuilder(ConversationParticipant, 'cp1')
      .select('*')
      .where({
        $and: [
          {
            participant: this.em.getReference(User, participantIds[0]),
            conversation: {
              $in: qb2.getKnexQuery(),
            },
          },
        ],
      });

    const res = await qb1.getResult();
    await this.em.populate(res, ['conversation.participants']);
    return res[0]?.conversation;
    // return conversation;
  }

  async getAllConversationsCurrentUser(
    userId: number,
  ): Promise<Conversation[]> {
    const conversations: Conversation[] = await this.em.find(
      Conversation,
      {
        participants: {
          $eq: userId,
        },
      },
      {
        populate: ['participants', 'lastMessage'],
      },
    );

    // Get last message of each conversation
    const conversationTransform: Promise<Loaded<Message | User, never>[]>[] =
      [];

    for (const conversation of conversations) {
      conversationTransform.push(
        conversation.lastMessage.matching({
          limit: 1,
          orderBy: { id: 'DESC' },
          store: true,
        }),
        conversation.participants.matching({
          where: { id: { $ne: userId } },
          store: true,
        }),
      );
    }

    await Promise.all(conversationTransform);

    // raw query
    // const connection = this.em.getConnection();

    // const res = await connection.execute(`
    //     SELECT
    //       c.id,
    //       cp.user_id,
    //       u.username,
    //       m.message as last_message FROM conversation c
    //     JOIN conversation_participant cp ON c.id = cp.conversation_id
    //     JOIN user u ON u.id = cp.user_id
    //     JOIN (
    //       SELECT MAX(m.id) as message_id, m.conversation_id
    //       FROM message m
    //       GROUP BY m.conversation_id
    //     ) as last_message on last_message.conversation_id = c.id
    //     JOIN message m ON m.id = last_message.message_id
    //     WHERE cp.user_id = ?;
    // `, [userId]);

    // console.log('res ', res);

    return conversations;
  }

  async getConversationById(conversationId: number): Promise<Conversation> {
    return this.em.findOneOrFail(Conversation, conversationId, {
      populate: ['participants'],
      failHandler: findOneOrFailNotFoundExceptionHandler,
    });
  }

  async getMessagesByConversationId(
    conversationId: number,
    requestorId: number,
    limit?: number,
    offset?: number,
  ): Promise<Message[]> {
    // check if requestor is in conversation. If not, user doesn't have permission to view messages
    const conversation: Conversation = await this.getConversationById(
      conversationId,
    );

    const requestorInConversation: boolean =
      conversation.participants.isInitialized() &&
      conversation.participants
        .getItems()
        .some((participant: User) => participant.id === requestorId);
    
    if (!requestorInConversation) {
      throw new CustomForbiddenException(
        ErrorMessage.ACCESS_DENIED,
        ErrorCode.FORBIDDEN_ACCESS_DENIED,
      )
    }

    return this.em.find(Message, {
      conversation: conversationId,
    }, {
      populate: ['sender']
    });
  }
}
