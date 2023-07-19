import { Controller, Get, Post, Param, Query, Body, Req } from '@nestjs/common';
import { Public } from 'src/common/auth.constants';
import { User } from '../user/entities/user.entity';
import { ITokenPayload } from '../auth/auth.interface';
import { MeService } from './me.service';

@Controller('me')
export class MeController {
    constructor(
        private meService: MeService
    ){}
    
    @Get('profile')
    async getMyProfile(@Req() request: Request): Promise<User> {
        const user : ITokenPayload = request['user'];

        return this.meService.getMyProfile(user);    
    }


}