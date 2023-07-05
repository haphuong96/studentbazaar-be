import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
} from '@mikro-orm/core';
import { Item } from './item.entity';

@Entity()
export class ItemCondition {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  conditionName!: string;

  @OneToMany({ mappedBy: 'condition' })
  item?: Item;
}
