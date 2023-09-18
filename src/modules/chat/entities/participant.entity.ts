import {
  types,
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
} from '@mikro-orm/core';
import { Conversation } from './conversation.entity';
import { User } from '../../user/entities/user.entity';
import { Message } from './message.entity';

@Entity()
export class ConversationParticipant {
  @ManyToOne({ entity: () => Conversation })
  conversation!: Conversation;

  @ManyToOne({ entity: () => User, name: 'user_id' })
  participant!: User;

  @ManyToOne({ entity: () => Message })
  lastReadMessage?: Message;

  @PrimaryKey()
  id!: number;
}
