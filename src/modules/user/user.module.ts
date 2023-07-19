import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';

@Module({
  controllers: [MeController],
  providers: [MeService],
  imports: [MikroOrmModule.forFeature([User])],
})
export class UserModule {}
