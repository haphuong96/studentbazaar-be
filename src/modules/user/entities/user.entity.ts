import {
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { University } from '../../market/entities/university.entity';
import { CampusLocation } from '../../market/entities/campus.entity';

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @ManyToOne()
  university!: University;

  @ManyToOne()
  campus?: CampusLocation;

  @Property({ length: 255 })
  fullname?: string;

  @Property({ length: 255 })
  username!: string;

  @Property({ length: 255 })
  emailAddress!: string;

  @Property({ columnType: 'varbinary(255)', hidden: true })
  password!: string;

  @Enum(() => UserStatus)
  status!: UserStatus;
  
  constructor(user: {
    id?: number;
    username: string;
    emailAddress: string;
    university?: University;
    campus?: CampusLocation;
    fullname?: string;
    password?: string;
  }) {
    this.id = user.id;
    this.university = user.university;
    this.campus = user.campus;
    this.fullname = user.fullname;
    this.username = user.username;
    this.emailAddress = user.emailAddress;
    this.password = user.password;
  }
}

export enum UserStatus {
  UNVERIFIED = 'UNVERIFIED',
  VERIFIED = 'VERIFIED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}
