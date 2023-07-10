import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../user/entities/user.entity';
import { University } from '../market/entities/university.entity';
import { JwtModule } from '@nestjs/jwt/dist';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    MikroOrmModule.forFeature([User, University]),
    // https://github.com/nestjs/jwt/blob/master/README.md
    JwtModule.register({
      global: true,
    }),
  ],
})
export class AuthModule {}
