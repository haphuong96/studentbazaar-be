import { Controller, Get, Post, Param, Query, Body, Req } from '@nestjs/common';
import { Public } from 'src/common/auth.constants';
import { User } from '../user/entities/user.entity';
import { ITokenPayload, RequestWithUser } from '../auth/auth.interface';
import { MeService } from './me.service';
import { UserService } from './user.service';

@Controller('me')
export class MeController {
  constructor(private userService: UserService) {}

  @Get('profile')
  async getMyProfile(@Req() request: RequestWithUser): Promise<User> {
    const user: ITokenPayload = request.user;

    return this.userService.getUserById(user.sub);
  }
}
