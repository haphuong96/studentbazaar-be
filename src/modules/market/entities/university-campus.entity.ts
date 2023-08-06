import {
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { User } from '../../user/entities/user.entity';
import { CampusLocation } from './campus.entity';
import { University } from './university.entity';

@Entity()
export class UniversityCampus {
  @PrimaryKey()
  id!: number;

  @ManyToOne()
  university!: University;

  @ManyToOne()
  campusLocation!: CampusLocation;
}
