import {
  types,
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToOne
} from '@mikro-orm/core';
import { Item } from './item.entity';
import { Image } from '../../img/image.entity';

@Entity()
export class ItemImage {
  @PrimaryKey()
  id!: number;

  @OneToOne()
  image!: Image;

  @ManyToOne()
  item!: Item;
}
