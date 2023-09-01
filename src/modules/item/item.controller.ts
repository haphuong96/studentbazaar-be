import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ITokenPayload, RequestWithUser } from '../auth/auth.interface';
import { AzureStorageBlob } from '../azure-blob-storage/blob.entity';
import { CreateItemDto, SearchItemDto, UpdateItemDto } from './dto/item.dto';
import { Item } from './entities/item.entity';
import { ItemService } from './item.service';

@Controller('items')
export class ItemController {
  constructor(private itemService: ItemService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  async postItem(
    @Req() request: Request,
    @Body() createItemDto: CreateItemDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ): Promise<void> {
    const user: ITokenPayload = request['user'];

    return await this.itemService.createItem(createItemDto, images, user.sub);
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
  async getOneItem(
    @Req() request: RequestWithUser,
    @Param('id') id: number,
  ): Promise<Item> {
    const user: ITokenPayload = request.user;

    const res = await this.itemService.getOneItem(id, user.sub);
    return res;
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

  @Post(':id/user_favorites/toggle')
  async toggleUserFavoriteItem(
    @Req() request: Request,
    @Param('id') id: number,
  ): Promise<Item> {
    const user: ITokenPayload = request['user'];

    return await this.itemService.toggleUserFavoriteItem(id, user.sub);
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadItemImage(
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<
    {
      image: AzureStorageBlob;
      thumbnail: AzureStorageBlob;
    }[]
  > {
    return await this.itemService.uploadItemImage(files);
  }

  @Delete(':id')
  async deleteItem(
    @Req() request: Request,
    @Param('id') id: number,
  ): Promise<boolean> {
    const user: ITokenPayload = request['user'];
    return await this.itemService.deleteItem(user.username, id);
  }
}
