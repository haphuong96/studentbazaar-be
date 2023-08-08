import {
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { User } from '../../user/entities/user.entity';
import { CampusLocation } from './campus.entity';
import { University } from './university.entity';
import { PickUpPoint } from './pickup-point.entity';

@Entity()
export class UniversityCampus {
  @PrimaryKey()
  id!: number;

  @ManyToOne()
  university!: University;

  @ManyToOne()
  campusLocation!: CampusLocation;

  @OneToMany( { mappedBy: 'universityCampusLocation'})
  pickUpPoints = new Collection<PickUpPoint>(this);
}
