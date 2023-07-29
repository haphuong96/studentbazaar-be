import {
  types,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  OneToMany,
  Enum,
  Collection
} from '@mikro-orm/core';
import { User } from '../../user/entities/user.entity';
import { ItemCategory } from './category.entity';
import { ItemCondition } from './condition.entity';
import { ItemImage } from './item-image.entity';

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

  @Enum(() => ItemStatus)
  status!: ItemStatus;

  @OneToMany({ mappedBy: 'item' })
  img? = new Collection<ItemImage>(this);

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

  constructor(item: {
    id?: number;
    owner: User;
    category?: ItemCategory;
    condition?: ItemCondition;
    status: ItemStatus;
    itemName?: string;
    itemDescription?: string;
    itemPrice?: number;
  }) {
    this.id = item.id;
    this.owner = item.owner;
    this.category = item.category;
    this.condition = item.condition;
    this.status = item.status;
    this.itemName = item.itemName;
    this.itemDescription = item.itemDescription;
    this.itemPrice = item.itemPrice;
  }
}



export enum ItemStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
  HIDDEN = 'HIDDEN',
}