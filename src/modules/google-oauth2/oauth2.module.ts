import { Module } from '@nestjs/common';
import { GoogleOauth2Service } from './oauth2.service';
import { GoogleOAuth2Controller } from './oauth2.controller';

@Module({
  controllers: [GoogleOAuth2Controller],
  providers: [GoogleOauth2Service],
  exports: [GoogleOauth2Service],
})
export class GoogleOauth2Module {}
