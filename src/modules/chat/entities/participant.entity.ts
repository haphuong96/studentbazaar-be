import {
  types,
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
} from '@mikro-orm/core';
import { Conversation } from './conversation.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class ConversationParticipant {
  @PrimaryKey()
  id!: number;

  @ManyToOne()
  conversation!: Conversation;

  @ManyToOne()
  participant!: User;
}