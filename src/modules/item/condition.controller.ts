import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { ItemCategory } from "./entities/category.entity";
import { ItemCategoryService } from "./category.service";
import { ItemConditionService } from "./condition.service";
import { ItemCondition } from "./entities/condition.entity";

@Controller()
export class ItemConditionController {
    constructor(
        private itemConditionService: ItemConditionService
    ){}

    @Get('item-conditions')
    async getAllItemConditions(): Promise<ItemCondition[]> {
        return await this.itemConditionService.getAllItemConditions();
    }
}