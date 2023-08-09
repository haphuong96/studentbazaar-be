import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Param,
  UploadedFiles,
  UseInterceptors,
  Put,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { ITokenPayload } from '../auth/auth.interface';
import { CreateItemDto, SearchItemDto, UpdateItemDto } from './dto/item.dto';
import { Item } from './entities/item.entity';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Image } from '../img/image.entity';

@Controller('items')
export class ItemController {
  constructor(private itemService: ItemService) {}

  @Post()
  async postItem(
    @Req() request: Request,
    @Body() createItemDto: CreateItemDto,
  ): Promise<void> {
    const user: ITokenPayload = request['user'];

    return await this.itemService.createItem(createItemDto, user.sub);
  }

  @Get()
  async getItems(@Query() query: SearchItemDto): Promise<
    | {
        total: number;
        items: Item[];
      }
    | {
        nextCursor: number | string;
        items: Item[];
      }
  > {
    return await this.itemService.getItems(query);
  }

  @Get(':id')
  async getOneItem(@Param('id') id: number): Promise<Item> {
    return await this.itemService.getOneItem(id);
  }

  @Put(':id')
  async updateItem(
    @Req() request: Request,
    @Param('id') id: number,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    const user: ITokenPayload = request['user'];

    return await this.itemService.updateItem(updateItemDto, id, user.sub);
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadItemImage(
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<
    {
      image: Image;
      thumbnail: Image;
    }[]
  > {
    return await this.itemService.uploadItemImage(files);
  }
}
