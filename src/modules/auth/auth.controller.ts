import { Controller, Get, Param, Query } from '@nestjs/common';
import { University } from '../market/entities/university.entity';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
    constructor(
        private authService: AuthService
    ){}

    @Get('signup')
    checkEmailAddress(@Query('email') email: string): Promise<University> {
        return this.authService.checkEmailAddress(email);    
    }
}