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
  @ManyToOne()
  conversation!: Conversation;

  @ManyToOne({name: 'user_id'})
  participant!: User;

  @ManyToOne()
  lastReadMessage?: Message;

  @PrimaryKey()
  id!: number;

}
