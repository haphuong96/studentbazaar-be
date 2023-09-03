import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Server, Socket } from 'socket.io';
import { JWTTokensUtility } from '../auth/utils/jwt-token.util';
import { ITokenPayload } from '../auth/auth.interface';
import { WsException } from '@nestjs/websockets';
import { ErrorCode } from '../../common/exceptions/constants.exception';

/**
 * https://github.com/nestjs/nest/issues/882
 * IO adapter to authenticate socket.io connections using socket middlewares.
 */
export class AuthenticatedWsIoAdapter extends IoAdapter {
  private jwtService: JWTTokensUtility;

  constructor(private app: INestApplicationContext) {
    super(app);
    this.jwtService = app.get(JWTTokensUtility);
  }

  create(port: number, options?: ServerOptions) {
    const server: Server = super.create(port, options);
    server.use(async (socket: Socket, next) => {
      const token = this.retrieveUserFromSocket(socket);
      if (token) {
        const user: ITokenPayload = await this.jwtService.verifyAccessToken(
          token,
        );
        if (user) {
          socket['user'] = user;
          next();
        }
      } else {
        next(new WsException(ErrorCode.UNAUTHORIZED));
      }
    });
    return server;
  }

  private retrieveUserFromSocket(socket: Socket) {
    const bearerToken: string = socket.handshake.auth.token
      ? socket.handshake.auth.token
      : socket.handshake.headers.authorization;
    if (bearerToken) {
      const [type, token] = bearerToken.split(' ') ?? [];

      return type === 'Bearer' ? token : undefined;
    }
  }

  //   createIOServer(port: number, options?: ServerOptions) {
  //     options.allowRequest = async (req, allowFunction) => {
  //       const token = req;
  //       if (token === '12345678') {
  //         allowFunction(null, true);
  //       } else {
  //         allowFunction('Authentication error', false);
  //       }
  //     };

  //     const server = super.createIOServer(port, options);
  //     server.use((socket, next) => {
  //       const token = socket.handshake.query.token;
  //       if (token === '12345678') {
  //         return next();
  //       }
  //       return next(new Error('Authentication error'));
  //     });
  //     return server;
  //   }
}
