import {
  Entity,
  EntityDTO,
  ManyToOne,
  PrimaryKey,
  Property,
  wrap,
} from '@mikro-orm/core';

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

  toJSON(...args: any[]): { [p: string]: any } {
    const o: EntityDTO<this> = wrap(this, true).toObject(...args); // do not forget to pass rest params here
    if (o['universityCampusLocation']) {
      o['campusLocation'] = o['universityCampusLocation']['campusLocation'];
      o['university'] = o['universityCampusLocation']['university'];
      delete o['universityCampusLocation'];
    }
    return o;
  }
}
