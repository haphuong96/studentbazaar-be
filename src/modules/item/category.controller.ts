import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { ItemCategory } from "./entities/category.entity";
import { ItemCategoryService } from "./category.service";

@Controller()
export class ItemCategoryController {
    constructor(
        private itemCatService: ItemCategoryService
    ){}

    @Get('item-categories')
    async getAllItemCategories(): Promise<ItemCategory[]> {
        return await this.itemCatService.getAllItemCategories();
    }
}