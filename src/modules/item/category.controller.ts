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
        const result =  await this.itemCatService.getAllItemCategories();
        console.log(result);
        return result;
    }

    @Get(':categoryPath')
    async getOneItemCategoryByPath(@Param('categoryPath') categoryPath: string): Promise<ItemCategory> {
        return await this.itemCatService.getOneItemCategoryByPath(categoryPath);
    }
}