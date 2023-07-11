import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../user/entities/user.entity';
import { University } from '../market/entities/university.entity';
import { JwtModule } from '@nestjs/jwt/dist';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { AuthUtility } from 'src/modules/auth/auth.util';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthUtility,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  imports: [
    MikroOrmModule.forFeature([User, University]),
    // https://github.com/nestjs/jwt/blob/master/README.md
    JwtModule.register({
      global: true,
    }),
  ],
})
export class AuthModule {}
