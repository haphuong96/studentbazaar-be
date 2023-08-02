import {
  Entity,
  PrimaryKey,
} from '@mikro-orm/core';

@Entity()
export class Conversation {
  @PrimaryKey()
  id!: number;
}
