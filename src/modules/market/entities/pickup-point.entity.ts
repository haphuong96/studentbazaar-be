import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { UniversityCampus } from './university-campus.entity';

@Entity()
export class PickUpPoint {
  @PrimaryKey()
  id!: number;

  @ManyToOne()
  universityCampusLocation!: UniversityCampus;

  @Property()
  name!: string;

  @Property()
  address!: string;
}
