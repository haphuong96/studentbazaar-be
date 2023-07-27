import { CanActivate, Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/common/auth.constants';
import {
  ErrorCode,
  ErrorMessage,
} from 'src/common/exceptions/constants.exception';
import { CustomUnauthorizedException } from 'src/common/exceptions/custom.exception';
import { JWTTokensUtility } from 'src/modules/auth/utils/jwt-token.util';

// https://docs.nestjs.com/security/authentication#implementing-the-authentication-guard
@Injectable()
export class AuthGuard implements CanActivate {
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
    if (!token) {
      throw new CustomUnauthorizedException(
        ErrorMessage.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED,
      );
    }

    // verify token. If valid, assign decoded user to request. Else, throw error
    request['user'] = await this.jwtTokensUtility.verifyAccessToken(token);

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const header = request.headers as Headers & { authorization?: string };
    const [type, token] = header.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
