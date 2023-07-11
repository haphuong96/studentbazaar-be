import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { University } from '../market/entities/university.entity';
import { AuthService } from './auth.service';
import { LoginDto, RegisterUserDto } from './dto/signup.dto';
import { Public } from 'src/common/auth.constants';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ){}
    
    @Public()
    @Get('signup')
    checkEmailAddress(@Query('email') email: string): Promise<University> {
        return this.authService.checkEmailAddress(email);    
    }

    @Public()
    @Post('signup')
    register(@Body() registerUserDto : RegisterUserDto): Promise<void> {
        return this.authService.registerUser(registerUserDto);
    }

    @Public()
    @Post('login')
    login(@Body() loginDto: LoginDto): Promise<{accessToken: string, refreshToken: string}> {
        return this.authService.verifyUser(loginDto);
    }

    @Public()
    @Post('refresh-token')
    refreshToken(@Body('refreshToken') refreshToken: string ): Promise<{accessToken: string, refreshToken: string}> {
        console.log('r1', refreshToken);
        return this.authService.refreshToken(refreshToken);
    }

    @Get('test')
    test(): string { return 'test'; };

}