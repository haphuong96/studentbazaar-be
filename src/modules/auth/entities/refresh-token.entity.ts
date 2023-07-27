import {
  types,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique
} from '@mikro-orm/core';
import { User } from '../../user/entities/user.entity';

@Entity()
@Unique({ properties: ['user'] })
export class RefreshToken {
  @PrimaryKey()
  id!: number;

  @ManyToOne()
  user!: User;

  @Property()
  refreshToken!: string;
}
