import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
// import { retrieveRefreshToken } from 'src/utils/oauth2.util';

// https://github.com/mwanago/nestjs-typescript/blob/master/src/email/email.service.ts
@Injectable()
export class EmailService {
  private nodemailerTransport: Mail;

  constructor(private configService: ConfigService) {
    this.nodemailerTransport = createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        clientId: this.configService.get<string>('googleOauth2.clientId'),
        clientSecret: this.configService.get<string>(
          'googleOauth2.clientSecret',
        ),
        refreshToken: this.configService.get<string>('googleOauth2.refreshToken'),
      },
    });
  }

  async sendMail(emailOptions: Mail.Options) {
    this.nodemailerTransport.sendMail(emailOptions);
  }
}
