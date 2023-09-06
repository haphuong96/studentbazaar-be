import {
  Entity,
  PrimaryKey,
  ManyToMany,
  OneToMany,
  Collection,
  Property,
  types,
} from '@mikro-orm/core';
import { ConversationParticipant } from './participant.entity';
import { User } from '../../user/entities/user.entity';
import { Message } from './message.entity';

@Entity()
export class Conversation {
  @PrimaryKey()
  id!: number;

  @ManyToMany({
    entity: () => User,
    pivotEntity: () => ConversationParticipant,
  })
  participants = new Collection<User>(this);

  @OneToMany({ mappedBy: 'conversation' })
  messages = new Collection<Message>(this);

  @OneToMany({ mappedBy: 'conversation', persist: false })
  lastMessage = new Collection<Message>(this);

  @Property({ persist: false })
  isNew?: boolean;

  @Property({ persist: false })
  isRead?: boolean;
}

export class ConversationWithLastMessage {}
