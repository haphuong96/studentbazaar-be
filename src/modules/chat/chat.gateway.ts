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
import { WsJwtAuthGuard } from '../auth/guards/ws-auth.guard';
import { ITokenPayload } from '../auth/auth.interface';
import { ClientData } from './chat.interface';
import { ErrorCode } from 'src/common/exceptions/constants.exception';
import { WsExceptionsFilter } from 'src/common/exceptions/filter.exception';

@Injectable()
// @UseGuards(WsJwtAuthGuard)
@WebSocketGateway({ cors: { origin: 'http://localhost:5173' } })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  /**
   * Verify client on connection
   * @param socket
   * @param args
   */
  @UseFilters(new WsExceptionsFilter())
  async handleConnection(socket: Socket, ...args: any[]) {
    console.log('client connected', socket.id);

    const user = await this.chatService.retrieveUserFromSocket(socket);

    if (!user) {
      socket.disconnect();
      // throw new WsException(ErrorCode.UNAUTHORIZED);
    }

    console.log(user)
    socket.handshake.auth.user = {...user};
  }

  @SubscribeMessage('message')
  onMessage(
    @MessageBody() data: ClientData,
    @ConnectedSocket() socket: Socket,
  ): void { //   WsResponse<void>
    // If authenticated, send message to all clients & store messages
    const user: ITokenPayload = socket.handshake.auth.user;
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
