import { Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import { ItemService } from "./item.service";
import { ITokenPayload } from "../auth/auth.interface";
import { CreateItemDto, SearchItemDto } from "./dto/item.dto";
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
    async getItems(@Query() query: SearchItemDto): Promise<Item[]> {
        return await this.itemService.getItems(query);
    }
}