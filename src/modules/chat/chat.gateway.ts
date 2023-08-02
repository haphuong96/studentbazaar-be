import {
  MessageBody,
  SubscribeMessage,
  ConnectedSocket,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Injectable, UseGuards } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { WsJwtAuthGuard } from '../auth/guards/ws-auth.guard';
import { ITokenPayload } from '../auth/auth.interface';
import { ClientData } from './chat.interface';

@Injectable()
@UseGuards(WsJwtAuthGuard)
@WebSocketGateway({ cors: { origin: 'http://localhost:5173' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}
  @SubscribeMessage('message')
  onMessage(
    @MessageBody() data: ClientData,
    @ConnectedSocket() socket: Socket,
  ): void //   WsResponse<void>
  {
    // Verify user is authenticated
    // If authenticated, send message to all clients & store messages
    const user: ITokenPayload = data.user;

    //create conversation if not exists

    //save message
    const messages = this.chatService.saveMessage(user.sub, data.message);

    console.log('data', data);
    // socket.request.
    this.server.emit('message', data.message);

    // return {event: 'message', data: 'server hello' + data};

    // client.emit('message', 'server hello' + data);
  }
}
