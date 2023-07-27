import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Module({
  controllers: [MeController],
  providers: [MeService, UserService],
  imports: [MikroOrmModule.forFeature([User])],
  exports: [UserService],
})
export class UserModule {}
