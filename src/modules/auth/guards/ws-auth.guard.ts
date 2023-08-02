import {
  CanActivate,
  Injectable,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/common/auth.constants';
import {
  ErrorCode,
  ErrorMessage,
} from 'src/common/exceptions/constants.exception';
import { CustomUnauthorizedException } from 'src/common/exceptions/custom.exception';
import { JWTTokensUtility } from 'src/modules/auth/utils/jwt-token.util';
import { WsException } from '@nestjs/websockets';
import { ITokenPayload } from '../auth.interface';
import { Socket } from 'socket.io';
import { IncomingHttpHeaders } from 'http';

// https://docs.nestjs.com/security/authentication#implementing-the-authentication-guard
@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(
    private jwtTokensUtility: JWTTokensUtility,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('WsJwtAuthGuard');
    const client: Socket = context.switchToWs().getClient();
    const token: string = this.extractTokenFromClient(client);
    console.log('token', token);
    if (token) {
      // verify token. If valid, assign decoded user to request. Else, throw error
      const decodedPayload = await this.jwtTokensUtility.verifyAccessToken(
        token,
      );
      if (decodedPayload) {
        context.switchToWs().getData()['user'] = decodedPayload;
        return true;
      }
    }
    //if no token attached or token is invalid, throw error
    throw new WsException(ErrorCode.UNAUTHORIZED);
  }

  private extractTokenFromClient(client: Socket): string | undefined {
    const header = client.handshake.headers as IncomingHttpHeaders & {
      authorization?: string;
    };
    const [type, token] = header.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
