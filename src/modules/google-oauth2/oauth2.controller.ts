import {
  Controller,
  Get,
  Query,
  Redirect,
} from '@nestjs/common';
import { Public } from 'src/common/auth.constants';
import { GoogleOauth2Service } from './oauth2.service';

@Controller('google')
export class GoogleOAuth2Controller {
  constructor(private googleOauth2Service: GoogleOauth2Service) {}

  @Public()
  @Redirect()
  @Get('auth')
  async authorize(): Promise<{ url?: string; statusCode?: number }> {
    return {
      url: this.googleOauth2Service.getAuthorizationUrl(),
    };
  }

  @Get('oauth2callback')
  async callbackOauth(@Query() query: { error?: any; code?: string }) {
    if (query.error) {
      console.log(query.error);
    } else if (query.code) {
      // exchange code for access token and refresh token
      const tokens = await this.googleOauth2Service.exchangeCodeForTokens(
        query.code,
      );
      // save tokens
      return this.googleOauth2Service.saveTokens(tokens);
    }
  }
}
