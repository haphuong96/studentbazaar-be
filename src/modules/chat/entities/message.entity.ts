import {
  types,
  Entity,
  PrimaryKey,
  Property,
  Enum,
  ManyToOne,
} from '@mikro-orm/core';
import { Conversation } from './conversation.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Message {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255})
  message!: string;

  @ManyToOne()
  conversation!: Conversation;

  @ManyToOne()
  sender!: User;

  @Enum(() => MessageType)
  messageType!: MessageType;

  @Property({ type: types.datetime, defaultRaw: `current_timestamp()` })
  createdDatetime!: Date;
}

export enum MessageType {
    MESSAGE = 'message',
}