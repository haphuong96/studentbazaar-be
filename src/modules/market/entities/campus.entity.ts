import {
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { User } from '../../user/entities/user.entity';
import { University } from './university.entity';

@Entity()
export class CampusLocation {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  campusName!: string;

  @ManyToMany({ mappedBy: 'campuses' })
  universities = new Collection<University>(this);

  @OneToMany({ mappedBy: 'campus' })
  user?: User;
}
