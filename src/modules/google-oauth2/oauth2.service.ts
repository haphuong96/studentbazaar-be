import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { OAuth2Client, Credentials } from 'google-auth-library';
import fs from 'fs';
import { GoogleOauth2TokenResponse } from './oauth2.interface';

@Injectable()
export class GoogleOauth2Service {
  private oauth2Client: OAuth2Client;
  private authorizationUrl: string;
  private scopes: string[] | string;

  constructor(private configService: ConfigService) {
    this.oauth2Client = new google.auth.OAuth2({
      clientId: configService.get<string>('googleOauth2.clientId'),
      clientSecret: configService.get<string>('googleOauth2.clientSecret'),
      redirectUri: configService.get<string>('googleOauth2.redirectUri'),
    });
    this.scopes = this.configService.get<string>('googleOauth2.emailScope');
    this.authorizationUrl = this.generateAuthorizationUrl(this.scopes);
  }

  generateAuthorizationUrl(scopes: string[] | string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
    });
  }

  getAuthorizationUrl(): string {
    return this.authorizationUrl;
  }

  async exchangeCodeForTokens(
    code: string,
  ): Promise<GoogleOauth2TokenResponse> {
    const { tokens } = await this.oauth2Client.getToken(code);
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      scope: tokens.scope,
      tokenType: tokens.token_type,
      expiryDate: tokens.expiry_date,
    };
  }

  saveTokens(tokens: GoogleOauth2TokenResponse) {
    fs.writeFileSync(
      './oauth2-token.json',
      JSON.stringify({ refreshToken: tokens.refreshToken }),
      'utf8',
    );
  }
}
