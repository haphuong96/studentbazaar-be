import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { ItemCategory } from "./entities/category.entity";
import { ItemCategoryService } from "./category.service";

@Controller('item-categories')
export class ItemCategoryController {
    constructor(
        private itemCatService: ItemCategoryService
    ){}

    @Get()
    async getAllItemCategories(): Promise<ItemCategory[]> {
        return await this.itemCatService.getAllItemCategories();
    }

    @Get(':id')
    async getOneItemCategory(@Param('id') id: number): Promise<ItemCategory> {
        return await this.itemCatService.getOneItemCategory(id);
    }
}