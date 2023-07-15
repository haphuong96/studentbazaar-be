import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Item } from './entities/item.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Item])],
  controllers: [ItemController],
  providers: [ItemService],
})
export class ItemModule {}
