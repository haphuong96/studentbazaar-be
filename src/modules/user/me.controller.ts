import { Controller, Get, Put, Req, Body } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { ITokenPayload, RequestWithUser } from '../auth/auth.interface';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user.dto';
import { serialize } from '@mikro-orm/core';
import { Item } from '../item/entities/item.entity';
import { ItemService } from '../item/item.service';
@Controller('me')
export class MeController {
  constructor(
    private userService: UserService,
    private itemService: ItemService,
  ) {}

  @Get('profile')
  async getMyProfile(@Req() request: RequestWithUser): Promise<User> {
    const user: ITokenPayload = request.user;

    return await this.userService.getUserById(user.sub);
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

    return await this.itemService.getItems({ ownerId: user.sub });
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
