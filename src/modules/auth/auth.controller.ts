import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { University } from '../market/entities/university.entity';
import { AuthService } from './auth.service';
import { LoginDto, RegisterUserDto } from './dto/signup.dto';

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
    register(@Body() registerUserDto : RegisterUserDto): Promise<void> {
        return this.authService.registerUser(registerUserDto);
    }

    @Post('login')
    login(@Body() loginDto: LoginDto): Promise<{accessToken: string, refreshToken: string}> {
        return this.authService.verifyUser(loginDto);
    }

}