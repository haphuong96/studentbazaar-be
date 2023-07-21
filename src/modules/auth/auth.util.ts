import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ErrorCode,
  ErrorMessage,
} from 'src/common/exceptions/constants.exception';
import { ITokenPayload } from './auth.interface';
import { CustomUnauthorizedException } from 'src/common/exceptions/custom.exception';

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
      throw new CustomUnauthorizedException(
        ErrorMessage.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED,
      );
    }
  }

  async generateTokens(
    payload: ITokenPayload,
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
