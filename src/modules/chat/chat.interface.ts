import { MessageType } from './entities/message.entity';

export interface InboxPayload {
  receiverId?: number;
  conversationId?: number;
  message: string;
  messageType: MessageType;
}
