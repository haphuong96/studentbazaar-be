import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { ItemService } from "./item.service";
import { ITokenPayload } from "../auth/auth.interface";
import { CreateItemDto } from "./dto/item.dto";
import { Item } from "./entities/item.entity";

@Controller()
export class ItemController {
    constructor(
        private itemService: ItemService
    ){}

    @Post('items')
    async postItem(@Req() request: Request, @Body() createItemDto : CreateItemDto): Promise<void> {
        const user : ITokenPayload = request['user'];

        return await this.itemService.createItem(createItemDto, user.sub);
    }

    @Get('items')
    async getItems(): Promise<Item[]> {
        return await this.itemService.getItems();
    }
}