import { Module, forwardRef } from '@nestjs/common';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { MarketModule } from '../market/market.module';
import { UserController } from './user.controller';
import { ItemModule } from '../item/item.module';

@Module({
  controllers: [MeController, UserController],
  providers: [MeService, UserService],
  imports: [
    MikroOrmModule.forFeature([User]),
    MarketModule,
    forwardRef(() => ItemModule),
  ],
  exports: [UserService],
})
export class UserModule {}
