import { Body, Controller, Get, Param, Query } from '@nestjs/common';
import { ItemCategory } from './entities/category.entity';
import { ItemCategoryService } from './category.service';

@Controller('item-categories')
export class ItemCategoryController {
  constructor(private itemCatService: ItemCategoryService) {}

  @Get()
  async getAllItemCategories(): Promise<ItemCategory[]> {
    const result = await this.itemCatService.getAllItemCategories();
    return result;
  }

  @Get(':id')
  async getOneItemCategoryById(@Param('id') id: number): Promise<ItemCategory> {
    return await this.itemCatService.getOneItemCategory({ id });
  }

  @Get('path/:path')
  async getOneItemCategoryByPath(
    @Param('path') path: string,
  ): Promise<ItemCategory> {
    return await this.itemCatService.getOneItemCategory({ path });
  }
}
