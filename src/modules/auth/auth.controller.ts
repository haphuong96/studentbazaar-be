import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { University } from '../market/entities/university.entity';
import { AuthService } from './auth.service';
import { registerUserDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ){}

    @Get('signup')
    checkEmailAddress(@Query('email') email: string): Promise<University> {
        return this.authService.checkEmailAddress(email);    
    }

    @Post('signup')
    registerUser(@Body() registerUserDto : registerUserDto): Promise<void> {
        return this.authService.registerUser(registerUserDto);
    }

}