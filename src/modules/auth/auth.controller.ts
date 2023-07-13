import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { University } from '../market/entities/university.entity';
import { AuthService } from './auth.service';
import { LoginDto, RegisterUserDto } from './dto/signup.dto';
import { Public } from 'src/common/auth.constants';
import { User } from '../user/entities/user.entity';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ){}
    
    @Public()
    @Get('signup')
    async checkEmailAddress(@Query('email') email: string): Promise<University> {
        return this.authService.checkEmailAddress(email);    
    }

    @Public()
    @Post('signup')
    async register(@Body() registerUserDto : RegisterUserDto): Promise<void> {
        const newUser : User = await this.authService.registerUser(registerUserDto);

        const sent = await this.authService.sendVerificationEmail(newUser.emailAddress);
        return;
    }

    @Public()
    @Get('email/verify')
    async verifyEmail(@Query('token') token: string): Promise<string> {
        const isVerified : boolean = await this.authService.verifyEmail(token);
        if (isVerified) return "Email verified successfully";
    }

    @Public()
    @Post('email/resend-verification')
    async sendVerificationEmail(@Body('email') email: string): Promise<void> {
        const sent = await this.authService.sendVerificationEmail(email);
        return;
    }

    @Public()
    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<{accessToken: string, refreshToken: string}> {
        return this.authService.verifyUser(loginDto);
    }

    @Public()
    @Post('refresh-token')
    async refreshToken(@Body('refreshToken') refreshToken: string ): Promise<{accessToken: string, refreshToken: string}> {
        return this.authService.refreshToken(refreshToken);
    }

    @Get('test')
    test(): string { return 'test'; };

}