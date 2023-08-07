import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { MarketModule } from '../market/market.module';
import { UserController } from './user.controller';

@Module({
  controllers: [MeController, UserController],
  providers: [MeService, UserService],
  imports: [MikroOrmModule.forFeature([User]), MarketModule],
  exports: [UserService],
})
export class UserModule {}
