import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ITokenPayload } from '../auth.interface';

@Injectable()
export class JWTTokensUtility {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signAccessToken(payload: ITokenPayload): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>(
        'jwtConstants.accessTokenExpire',
      ),
      secret: this.configService.get<string>('jwtConstants.accessTokenSecret'),
    });
  }

  async signRefreshToken(payload: ITokenPayload): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>(
        'jwtConstants.refreshTokenExpire',
      ),
      secret: this.configService.get<string>('jwtConstants.refreshTokenSecret'),
    });
  }

  async verifyAccessToken(token: string): Promise<ITokenPayload | undefined> {
    return this.verifyToken(
      token,
      this.configService.get<string>('jwtConstants.accessTokenSecret'),
    );
  }

  async verifyRefreshToken(token: string): Promise<ITokenPayload | undefined> {
    return this.verifyToken(
      token,
      this.configService.get<string>('jwtConstants.refreshTokenSecret')
    );
  }

  private async verifyToken(
    token: string,
    secret: string,
  ): Promise<ITokenPayload | undefined> {
    try {
      const { sub, username, ...rest } = await this.jwtService.verifyAsync(
        token,
        {
          secret: secret,
        },
      );

      return { sub, username };
    } catch (err) {
      return;
    }
  }
}
