import {
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Item } from '../../item/entities/item.entity';
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

  @OneToMany({ mappedBy: 'owner' })
  item?: Item;

  @Property({ length: 255 })
  fullname?: string;

  @Property({ length: 255 })
  username!: string;

  @Property({ length: 255 })
  emailAddress!: string;

  @Property({ columnType: 'varbinary(255)', hidden: true })
  password!: string;

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
