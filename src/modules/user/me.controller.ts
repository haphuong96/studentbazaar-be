import { Controller, Get, Put, Req, Body } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { ITokenPayload, RequestWithUser } from '../auth/auth.interface';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user.dto';
import { serialize } from '@mikro-orm/core';
import { Item } from '../item/entities/item.entity';
import { ItemService } from '../item/item.service';
import { University } from '../market/entities/university.entity';
import { MarketService } from '../market/market.service';
@Controller('me')
export class MeController {
  constructor(
    private userService: UserService,
    private itemService: ItemService,
    private marketService: MarketService,
  ) {}

  @Get('profile')
  async getMyProfile(@Req() request: RequestWithUser): Promise<User> {
    const user: ITokenPayload = request.user;

    return await this.userService.getUserById(user.sub);
  }

  @Get('university')
  async getMyUniversity(@Req() request: RequestWithUser): Promise<University> {
    const payload: ITokenPayload = request.user;
    const user: User = await this.userService.getUserById(payload.sub);
    return await this.marketService.getUniversityByEmailAddress(
      user.emailAddress,
    );
  }

  @Get('items')
  async getMyItems(@Req() request: RequestWithUser): Promise<
    | {
        total: number;
        items: Item[];
      }
    | {
        nextCursor: string | number;
        items: Item[];
      }
  > {
    const user: ITokenPayload = request.user;

    return await this.itemService.getItems({ ownerId: user.sub }, true);
  }

  @Get('item-favorites')
  async getMyFavoriteItems(@Req() request: RequestWithUser): Promise<Item[]> {
    const user: ITokenPayload = request.user;

    return await this.userService.getFavoriteItems(user.sub);
  }

  @Put('profile')
  async updateMyProfile(
    @Req() request: RequestWithUser,
    @Body() user: UpdateUserDto,
  ): Promise<User> {
    const requestUser: ITokenPayload = request.user;

    return await this.userService.updateUser(user, requestUser.sub);
  }

  @Put('account/activate')
  async activateAccount(@Req() request: RequestWithUser): Promise<boolean> {
    const requestUser: ITokenPayload = request.user;

    return await this.userService.activateAccount(requestUser.sub);
  }
}
