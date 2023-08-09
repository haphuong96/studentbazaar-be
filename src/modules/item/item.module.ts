import { Module, forwardRef } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Item } from './entities/item.entity';
import { ItemCategoryController } from './category.controller';
import { ItemCategoryService } from './category.service';
import { ItemCategory } from './entities/category.entity';
import { ItemConditionController } from './condition.controller';
import { ItemConditionService } from './condition.service';
import { ItemCondition } from './entities/condition.entity';
import { UserModule } from '../user/user.module';
import { AzureBlobStorageClientModule } from '../azure-blob-storage/blob-storage.module';
import { MarketModule } from '../market/market.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Item, ItemCategory, ItemCondition]),
    forwardRef(() => UserModule),
    AzureBlobStorageClientModule,
    MarketModule
  ],
  controllers: [
    ItemController,
    ItemCategoryController,
    ItemConditionController,
  ],
  providers: [ItemService, ItemCategoryService, ItemConditionService],
  exports: [ItemService]
})
export class ItemModule {}
