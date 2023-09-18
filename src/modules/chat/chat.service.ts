import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JWTTokensUtility } from '../auth/utils/jwt-token.util';
import { ITokenPayload } from '../auth/auth.interface';
import { WsException } from '@nestjs/websockets';
import {
  AbstractSqlConnection,
  EntityManager,
  QueryBuilder,
} from '@mikro-orm/mysql';
import { Conversation } from './entities/conversation.entity';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { findOneOrFailNotFoundExceptionHandler } from '../../utils/exception-handler.util';
import { Message, MessageType } from './entities/message.entity';
import {
  ErrorCode,
  ErrorMessage,
} from '../../common/exceptions/constants.exception';
import { ConversationParticipant } from './entities/participant.entity';
import { Loaded, WrappedEntity, wrap } from '@mikro-orm/core';
import { CustomForbiddenException } from '../../common/exceptions/custom.exception';

@Injectable()
export class ChatService {
  constructor(
    private jwtService: JWTTokensUtility,
    private readonly em: EntityManager,
    private readonly userService: UserService,
  ) {}
  async saveMessage(
    senderId: number,
    message: string,
    receiverId?: number,
    conversationId?: number,
  ): Promise<Message> {
    // if no conversationId, check if conversation existed based on participants. If not, create new conversation
    const conversation: Conversation = conversationId
      ? await this.getConversationById(conversationId, senderId)
      : (await this.getOneToOneConversationByParticipants([
          senderId,
          receiverId,
        ])) || (await this.createNewConversation([senderId, receiverId]));

    const sender: User = await this.userService.getUserById(senderId);

    const newMessage: Message = this.em.create(Message, {
      messageType: MessageType.MESSAGE,
      sender: sender,
      message,
      conversation: conversation,
    });

    // // update last read message of sender
    // const senderInConversation: ConversationParticipant = await this.em.findOne(
    //   ConversationParticipant,
    //   {
    //     participant: sender,
    //     conversation: conversation,
    //   }
    // )
    // senderInConversation.lastReadMessage = newMessage;

    await this.em.persistAndFlush(newMessage);

    return newMessage;
  }

  /**
   * Create new conversation. Support 1-1 conversation only
   * @param participantIds
   * @returns
   */
  async createNewConversation(participantIds: number[]): Promise<Conversation> {
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
        lastMessage: {
          $exists: true,
        },
      },
      {
        populate: ['participants', 'lastMessage', 'lastMessage.sender'],
        orderBy: { id: 'DESC' },
      },
    );

    // Get unread conversations
    const unreadConversations: Conversation[] =
      await this.getUnreadConversations(userId);
    const unreadConversationIdMap: Map<number, Conversation> = new Map();
    unreadConversations.forEach((unreadConversation: Conversation) => {
      unreadConversationIdMap.set(unreadConversation.id, unreadConversation);
    });

    // Get last message of each conversation + remove current user from participants
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

      // check if conversation is read
      wrap(conversation).assign({
        isRead: unreadConversationIdMap.has(conversation.id) ? false : true,
      });
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

  async getConversationById(
    conversationId: number,
    requestorId: number,
  ): Promise<Conversation> {
    console.log('conversationId ', conversationId);
    const conversation: Conversation = await this.em.findOneOrFail(
      Conversation,
      conversationId,
      {
        populate: ['participants'],
        failHandler: findOneOrFailNotFoundExceptionHandler,
      },
    );

    // check if requestor is in conversation. If not, user doesn't have permission to view conversation
    const requestorInConversation: boolean =
      conversation.participants.isInitialized() &&
      conversation.participants
        .getItems()
        .some((participant: User) => participant.id === requestorId);

    if (!requestorInConversation) {
      throw new CustomForbiddenException(
        ErrorMessage.ACCESS_DENIED,
        ErrorCode.FORBIDDEN_ACCESS_DENIED,
      );
    }

    // remove requestor from participants
    await conversation.participants.matching({
      where: { id: { $ne: requestorId } },
      store: true,
    });

    wrap(conversation).assign({
      isNew: (await conversation.messages.loadCount()) ? false : true,
    });

    return conversation;
  }

  async getMessagesByConversationId(
    conversationId: number,
    requestorId: number,
    limit?: number,
    offset?: number,
  ): Promise<Message[]> {
    const conversation: Conversation = await this.getConversationById(
      conversationId,
      requestorId,
    );

    return this.em.find(
      Message,
      {
        conversation: conversationId,
      },
      {
        populate: ['sender'],
      },
    );
  }

  /**
   * Mark conversation as read and update last message read by user and conversation
   * @param userId
   * @param messageId
   */
  async markMessageAsRead(
    userId: number,
    messageId: number,
  ): Promise<Conversation> {
    const message: Message = await this.em.findOneOrFail(Message, messageId, {
      populate: ['conversation'],
      failHandler: findOneOrFailNotFoundExceptionHandler,
    });

    // check if user is in conversation
    const userInConversation: ConversationParticipant =
      await this.em.findOneOrFail(
        ConversationParticipant,
        {
          participant: userId,
          conversation: message.conversation,
        },
        {
          populate: ['lastReadMessage'],
          failHandler: findOneOrFailNotFoundExceptionHandler,
        },
      );

    if (!userInConversation) {
      throw new CustomForbiddenException(
        ErrorMessage.ACCESS_DENIED,
        ErrorCode.FORBIDDEN_ACCESS_DENIED,
      );
    }

    // mark message as read
    userInConversation.lastReadMessage = message;

    await this.em.flush();

    return userInConversation.conversation;
  }

  async getUnreadConversations(userId: number): Promise<Conversation[]> {
    const connection: AbstractSqlConnection = this.em.getConnection();

    const query = `
                  SELECT 
                      cp.*, 
                      last_message.message_id 
                    FROM 
                      conversation_participant cp 
                    JOIN (
                      SELECT MAX(m.id) AS message_id, m.conversation_id
                      FROM message m
                      GROUP BY m.conversation_id
                    ) AS last_message ON cp.conversation_id = last_message.conversation_id
                    WHERE 
                      (cp.last_read_message_id <> last_message.message_id OR cp.last_read_message_id IS NULL)
                    AND 
                      cp.user_id = ?;
                  `;

    const res = await connection.execute(query, [userId]);

    const conversations: Conversation[] = await Promise.all(
      res.map(async (conversationParticipant) => {
        const cpMap: ConversationParticipant = this.em.map(
          ConversationParticipant,
          conversationParticipant,
        );

        await this.em.populate(cpMap, ['conversation']);
        return cpMap.conversation;
      }),
    );

    return conversations;
  }
}
