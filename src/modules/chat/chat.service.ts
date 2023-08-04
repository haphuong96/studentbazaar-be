import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JWTTokensUtility } from '../auth/utils/jwt-token.util';
import { ITokenPayload } from '../auth/auth.interface';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class ChatService {
  constructor(private jwtService: JWTTokensUtility) {}
  saveMessage(senderId: number, message: string) {
    
  }

  async retrieveUserFromSocket(socket: Socket) {
    const [type, token] = socket.handshake.auth.token.split(' ') ?? [];

    console.log('token', token);

    const user: ITokenPayload = await this.jwtService.verifyAccessToken(token);

    return user;
  }
}
