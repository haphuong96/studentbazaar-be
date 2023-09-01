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
import { Request } from 'express';

// https://docs.nestjs.com/security/authentication#implementing-the-authentication-guard
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtTokensUtility: JWTTokensUtility,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if it is a public endpoint
    const isPublic: boolean = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    // if it is, allow access
    if (isPublic) {
      return true;
    }

    // else, check if the request has a valid token
    const request: Request = context.switchToHttp().getRequest<Request>();

    const token: string = this.extractTokenFromHeader(request);

    if (token) {
      // verify token. If valid, assign decoded user to request. Else, throw error
      request['user'] = await this.jwtTokensUtility.verifyAccessToken(token);
      
      if (request['user']) {
        return true;
      }
      
    }

    //if no token attached or token is invalid, throw error
    throw new CustomUnauthorizedException(
      ErrorMessage.UNAUTHORIZED,
      ErrorCode.UNAUTHORIZED,
    );

  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
