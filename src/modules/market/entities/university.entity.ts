import {
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { User } from '../../user/entities/user.entity';
import { CampusLocation } from './campus.entity';

@Entity()
export class University {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  universityName!: string;

  @Property({ length: 255 })
  emailAddressDomain!: string;

  @ManyToMany( { pivotTable: 'university_campus'})
  campuses = new Collection<CampusLocation>(this);

  @OneToMany({ mappedBy: 'university' })
  user?: User;

  constructor(id: number, universityName: string, emailAddressDomain: string) {
    this.id = id;
    this.universityName = universityName;
    this.emailAddressDomain = emailAddressDomain;
  }
}
