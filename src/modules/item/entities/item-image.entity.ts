import {
  types,
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToOne,
  wrap,
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

  /**
   * Serialize image object only
   * @param args 
   * @returns 
   */
  toJSON(...args: any[]): { [p: string]: any } {
    const o = wrap(this, true).toObject(...args); // do not forget to pass rest params here

    return o['image'];
  }
}
