import {
  types,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
  Enum,
} from '@mikro-orm/core';
import { User } from '../../user/entities/user.entity';

@Entity()
@Unique({ properties: ['user', 'type'] })
export class EmailVerification {
  @PrimaryKey()
  id!: number;

  @ManyToOne()
  user!: User;

  @Property()
  token!: string;

  @Property({ type: types.datetime })
  expiredAt?: Date;

  @Enum(() => AuthenticationType)
  type!: AuthenticationType;
}

export enum AuthenticationType {
  EMAIL_VERIFICATION = 'EV',
  FORGOT_PASSWORD = 'FPW',
}
