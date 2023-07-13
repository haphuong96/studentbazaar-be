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
// import { AuthenticationType } from './type.entity';

@Entity()
@Unique({ properties: ['user', 'type'] })
export class Authentication {
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
