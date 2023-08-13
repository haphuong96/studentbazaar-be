import { Controller, Get, Put, Req, Body } from '@nestjs/common';
import { ITokenPayload, RequestWithUser } from '../auth/auth.interface';

import { ChatService } from './chat.service';
import { Conversation } from './entities/conversation.entity';
@Controller()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  async getAllConversationsCurrentUser(@Req() request:  RequestWithUser) : Promise<Conversation[]> {
    const user: ITokenPayload = request.user;
    return await this.chatService.getAllConversationsCurrentUser(user.sub);
  }
}
