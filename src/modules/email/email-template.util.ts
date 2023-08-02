import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailTemplate {
  constructor(private configService: ConfigService) {}

  getAccountVerificationEmailTemplate(token: string, username?: string): string {
    return `<br/><b>Hi${' '+ username}</b>, <br/><br/> Please verify your email by clicking the link below. The link expires in 1 hour and can only be used once.<br/><br/> 
    <a href="${this.configService.get<string>(
      'email.emailVerificationUrl',
    )}?token=${token}">Verify Email</a><br/><br/>
    If you didn’t request this verification and don’t have a Student Bazaar account then please ignore this email.<br/><br/>
    Team Student Bazaar`;
  }
}
