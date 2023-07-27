import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailTemplate } from './email-template.util';

@Module({
  providers: [EmailService, EmailTemplate],
  exports: [EmailService, EmailTemplate],
})
export class EmailModule {};
