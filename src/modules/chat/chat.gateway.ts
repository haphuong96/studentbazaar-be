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
import { InboxPayload, ReadMessagePayload } from './chat.interface';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { UseRequestContext, MikroORM } from '@mikro-orm/core';
import { ITokenPayload } from '../auth/auth.interface';
import { ConversationParticipant } from './entities/participant.entity';
import { Conversation } from './entities/conversation.entity';

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
  @UseRequestContext()
  async handleConnection(socket: Socket, ...args: any[]) {
    console.log('client connected', socket.id);

    const user: ITokenPayload = socket['user'];

    // join user to "user" room
    socket.join(user.sub.toString());

  }

  @SubscribeMessage('message')
  @UseRequestContext()
  async onMessage(
    @MessageBody() data: InboxPayload,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    //   WsResponse<void>
    // If authenticated, send message to all clients & store messages
    const user: ITokenPayload = socket['user'];

    // check conversation and save msg
    const message = await this.chatService.saveMessage(
      user.sub,
      data.message,
      data.receiverId,
      data.conversationId,
    );
    
    // mark message as read for sender (sender automatically read the message when sending)
    const messageNotification : Conversation = await this.chatService.markMessageAsRead(message.sender.id, message.id);

    // list of receivers "room"
    const receivers: string[] = message.conversation.participants
      .getItems()
      .map((participant: User) => participant.id.toString());

    // send message to all message receivers including sender
    this.server.to(user.sub.toString()).to(receivers).emit('message', message);
    
    console.log('message notification ', messageNotification)
    // send notification to all message receivers except sender
    this.server.to(receivers).emit('message_notification', messageNotification)
  }

  @SubscribeMessage('read_message')
  @UseRequestContext()
  async onReadMessage(
    @MessageBody() data: ReadMessagePayload,
    @ConnectedSocket() socket: Socket,
  ) : Promise<void> {
    const user: ITokenPayload = socket['user'];

    // mark conversation as read
    const conversationRead : Conversation = await this.chatService.markMessageAsRead(user.sub, data.messageId);
    
    this.server.to(user.sub.toString()).emit('read_message', conversationRead);
  }
}
