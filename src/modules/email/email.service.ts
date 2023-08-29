import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

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
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });
  }

  async sendMail(emailOptions: Mail.Options) {
    this.nodemailerTransport.sendMail(emailOptions);
  }
}
