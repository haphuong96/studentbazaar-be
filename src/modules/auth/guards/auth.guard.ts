import {
  CanActivate,
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from 'src/common/auth.constants';
import { errorMessage } from 'src/common/messages.common';
import { AuthUtility } from 'src/modules/auth/auth.util';

// https://docs.nestjs.com/security/authentication#implementing-the-authentication-guard
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    // private jwtService: JwtService,
    private authUtility: AuthUtility,
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if it is a public endpoint
    const isPublic : boolean = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // if it is, allow access
    if (isPublic) {
      return true;
    }

    // else, check if the request has a valid token
    const request : Request = context.switchToHttp().getRequest<Request>();

    const token : string = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(errorMessage.UNAUTHORIZED);
    }

    // try {
    //   const payload = await this.jwtService.verifyAsync(token, {
    //     secret: this.configService.get<string>(
    //       'jwtConstants.accessTokenSecret',
    //     ),
    //   });

    //   request['user'] = payload;
    // } catch {
    //   throw new UnauthorizedException(errorMessage.UNAUTHORIZED);
    // }
    request['user'] = await this.authUtility.verifyToken(token, this.configService.get<string>('jwtConstants.accessTokenSecret',
        ));

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const header = request.headers as Headers & { authorization?: string };
    const [type, token] = header.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
