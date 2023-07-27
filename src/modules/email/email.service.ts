import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

// https://github.com/mwanago/nestjs-typescript/blob/master/src/email/email.service.ts
@Injectable()
export class EmailService {
  private nodemailerTransport: Mail;
  
  constructor() {
    this.nodemailerTransport = createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });
  }

  async sendMail(emailOptions : Mail.Options) {
    this.nodemailerTransport.sendMail(emailOptions);
  }
}
