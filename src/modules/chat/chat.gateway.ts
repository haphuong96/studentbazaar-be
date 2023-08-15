import {
  MessageBody,
  SubscribeMessage,
  ConnectedSocket,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
  OnGatewayConnection,
  WsException,
} from '@nestjs/websockets';
import { Injectable, UseGuards, UseFilters } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
// import { WsJwtAuthGuard } from '../auth/guards/ws-auth.guard';
// import { ITokenPayload } from '../auth/auth.interface';
import { InboxPayload } from './chat.interface';
// import { ErrorCode } from 'src/common/exceptions/constants.exception';
import { User } from '../user/entities/user.entity';
import { Conversation } from './entities/conversation.entity';
import { UserService } from '../user/user.service';
import { UseRequestContext, MikroORM } from '@mikro-orm/core';
// import { WsExceptionsFilter } from 'src/common/exceptions/filter.exception';

@Injectable()
@WebSocketGateway({ cors: { origin: 'http://localhost:5173' } })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private orm: MikroORM,
    private chatService: ChatService,
    private userService: UserService,
  ) {}

  /**
   * Verify client on connection
   * @param socket
   * @param args
   */
  // @UseGuards(WsJwtAuthGuard)
  // @UseFilters(new WsExceptionFilter())
  @UseRequestContext()
  async handleConnection(socket: Socket, ...args: any[]) {
    console.log('client connected', socket.id);

    const user: User = await this.chatService.retrieveUserFromSocket(socket);

    if (user) {
      console.log(user);
      socket['user'] = { ...user };

      // join user to "user" room
      socket.join(user.id.toString());

      /** --------------Socket experiment*/
      // on connect, send all (online) users to client
      // const users = [];
      // for (let [id, socket] of this.server.of('/').sockets) {
      //   users.push({
      //     userID: id,
      //     username: socket['user'].username,
      //   });
      // }

      // this.server.emit('users', users);
    } else {
      socket.disconnect();
    }
  }

  @SubscribeMessage('message')
  @UseRequestContext()
  async onMessage(
    @MessageBody() data: InboxPayload,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    //   WsResponse<void>
    // If authenticated, send message to all clients & store messages
    const user: User = socket['user'];

    // check conversation and save msg
    // if no conversationId, check if conversation existed based on participants. If not, create new conversation
    const conversation: Conversation = data.conversationId
      ? await this.chatService.getConversationById(data.conversationId, user.id)
      : (await this.chatService.getOneToOneConversationByParticipants([
          user.id,
          data.receiverId,
        ])) ||
        (await this.chatService.createNewConversation([
          user.id,
          data.receiverId,
        ]));

    const message = await this.chatService.saveMessage(
      user,
      data.message,
      conversation,
    );

    // list of receivers "room"
    const receivers: string[] = conversation.participants
      .getItems()
      .map((participant: User) => participant.id.toString());

    // console.log('data', data);
    // console.log('from ', socket.id);
    console.log('receivers ', receivers);
    console.log('message ', message);
    this.server.to(user.id.toString()).to(receivers).emit(
      'message',
      message,
      // {
      //   message: message,
      //   from: user.id,
      // }
    );
  }
}
