import { Controller, Get, Param, Req, Body } from '@nestjs/common';
import { ITokenPayload, RequestWithUser } from '../auth/auth.interface';

import { ChatService } from './chat.service';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
@Controller()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  async getAllConversationsCurrentUser(
    @Req() request: RequestWithUser,
  ): Promise<Conversation[]> {
    const user: ITokenPayload = request.user;
    return await this.chatService.getAllConversationsCurrentUser(user.sub);
  }

  @Get('conversations/:conversationId')
  async getOneConversationById(
    @Req() request: RequestWithUser,
    @Param('conversationId') conversationId: number,
  ): Promise<Conversation> {
    const user: ITokenPayload = request.user;
    return await this.chatService.getConversationById(conversationId, user.sub);
  }

  @Get('conversations/to/:receiverId')
  async getOneToOneConversationByParticipants(
    @Req() request: RequestWithUser,
    @Param('receiverId') receiverId: number,
  ): Promise<Conversation> {
    const user: ITokenPayload = request.user;
    const conversation: Conversation =
      (await this.chatService.getOneToOneConversationByParticipants([
        user.sub,
        receiverId,
      ])) ||
      (await this.chatService.createNewConversation([user.sub, receiverId]));
    return conversation;
  }

  @Get('conversations/:conversationId/messages')
  async getMessagesByConversationId(
    @Req() request: RequestWithUser,
    @Param('conversationId') conversationId: number,
  ): Promise<Message[]> {
    const user: ITokenPayload = request.user;
    return await this.chatService.getMessagesByConversationId(
      conversationId,
      user.sub,
    );
  }
}
