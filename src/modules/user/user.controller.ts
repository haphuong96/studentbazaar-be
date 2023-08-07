import { Controller, Get, Put, Req, Body, Param } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('users/:id')
  async getUserProfile(@Param('id') id: number): Promise<User> {
    return this.userService.getUserById(id);
  }

}
