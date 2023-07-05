import {
  types,
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
} from '@mikro-orm/core';
import { Item } from './item.entity';

@Entity()
export class ItemImage {
  @PrimaryKey()
  id!: number;

  @Property({ type: types.text })
  imgPath!: string;

  @ManyToOne()
  item!: Item;
}
