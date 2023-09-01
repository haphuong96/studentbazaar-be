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

  @Public()
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
      this.googleOauth2Service.saveTokens(tokens);

      return "<h2>Successful authentication!</h2> You can now close this window.";
    }
  }
}
