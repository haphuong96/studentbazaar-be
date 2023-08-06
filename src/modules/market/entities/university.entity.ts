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
import { UniversityCampus } from './university-campus.entity';

@Entity()
export class University {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  universityName!: string;

  @Property({ length: 255, hidden: true })
  emailAddressDomain!: string;

  @ManyToMany( { pivotEntity: () => UniversityCampus })
  campuses = new Collection<CampusLocation>(this);

  constructor(id: number, universityName: string, emailAddressDomain: string) {
    this.id = id;
    this.universityName = universityName;
    this.emailAddressDomain = emailAddressDomain;
  }
}
