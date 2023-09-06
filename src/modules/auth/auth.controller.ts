import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Req,
  Redirect,
} from '@nestjs/common';
import { University } from '../market/entities/university.entity';
import { AuthService } from './auth.service';
import { LoginDto, RegisterUserDto } from './dto/signup.dto';
import { Public } from '../../common/auth.constants';
import { User } from '../user/entities/user.entity';
import { ITokenPayload, RequestWithUser } from './auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('email/validate')
  async checkEmailAddress(@Body('email') email: string): Promise<University> {
    return this.authService.checkEmailAddress(email);
  }

  @Public()
  @Post('signup')
  async register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<User> {
    const newUser: User = await this.authService.registerUser(registerUserDto);

    await this.authService.sendVerificationEmail(newUser.emailAddress);

    return newUser;
  }

  @Public()
  @Get('email/verify')
  async verifyEmail(@Query('token') token: string): Promise<string> {
    const isVerified: boolean = await this.authService.verifyEmail(token);
    if (isVerified) return 'Email verified successfully';
  }

  @Public()
  @Post('email/resend-verification')
  async sendVerificationEmail(@Body('email') email: string): Promise<void> {
    return await this.authService.sendVerificationEmail(email);
  }

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.verifyUser(loginDto);
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  async logout(@Req() request: RequestWithUser): Promise<void> {
    const user: ITokenPayload = request.user;

    return this.authService.deleteRefreshToken(user.sub);
  }
}
