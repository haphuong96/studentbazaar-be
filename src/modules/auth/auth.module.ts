import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../user/entities/user.entity';
import { University } from '../market/entities/university.entity';
import { JwtModule } from '@nestjs/jwt/dist';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { EmailVerification } from './entities/email-verification.entity';
import { JWTTokensUtility } from './utils/jwt-token.util';
import { EmailModule } from '../email/email.module';
import { RefreshToken } from './entities/refresh-token.entity';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JWTTokensUtility,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  imports: [
    MikroOrmModule.forFeature([University, EmailVerification, RefreshToken]),
    // https://github.com/nestjs/jwt/blob/master/README.md
    JwtModule.register({
      global: true,
    }),
    EmailModule,
    UserModule
  ],
})
export class AuthModule {}
