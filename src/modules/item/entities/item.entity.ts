import {
  types,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  OneToMany,
} from '@mikro-orm/core';
import { User } from '../../user/entities/user.entity';
import { ItemCategory } from './category.entity';
import { ItemCondition } from './condition.entity';
import { ItemStatus } from './status.entity';
import { ItemImage } from './image.entity';

@Entity()
export class Item {
  @PrimaryKey()
  id!: number;

  @ManyToOne()
  owner!: User;

  @ManyToOne()
  category!: ItemCategory;

  @ManyToOne()
  condition!: ItemCondition;

  @ManyToOne()
  status!: ItemStatus;

  @OneToMany({ mappedBy: 'item' })
  img?: ItemImage;

  @Property({ length: 255 })
  itemName!: string;

  @Property({ type: types.text })
  itemDescription?: string;

  @Property({ type: types.double })
  itemPrice?: number;

  @Property({ type: types.datetime, defaultRaw: `current_timestamp()` })
  createdDatetime!: Date;

  @Property({ type: types.datetime, defaultRaw: `current_timestamp()` })
  lastUpdatedDatetime!: Date;
}
