import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ErrorMessage } from 'src/common/messages.common';
import { ITokenPayload } from './auth.interface';

@Injectable()
export class AuthUtility {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async verifyToken(token: string, secret: string): Promise<ITokenPayload> {
    try {
      const { sub, username } = await this.jwtService.verifyAsync(token, {
        secret: secret,
      });

      const payload: ITokenPayload = { sub, username };

      return payload;
    } catch (err) {
      throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED);
    }
  }

  async generateTokens(
    payload: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>(
          'jwtConstants.accessTokenExpire',
        ),
        secret: this.configService.get<string>(
          'jwtConstants.accessTokenSecret',
        ),
      }),

      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>(
          'jwtConstants.refreshTokenExpire',
        ),
        secret: this.configService.get<string>(
          'jwtConstants.refreshTokenSecret',
        ),
      }),
    };
  }
}
