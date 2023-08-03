import {
  types,
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToOne,
  wrap,
  EntityDTO
} from '@mikro-orm/core';
import { Item } from './item.entity';
import { Image } from '../../img/image.entity';

@Entity()
export class ItemImage {
  @PrimaryKey()
  id!: number;

  @OneToOne()
  image!: Image;

  @OneToOne()
  thumbnail!: Image;

  @ManyToOne()
  item!: Item;

  /**
   * Serialize image object only
   * @param args
   * @returns
   */
  toJSON(...args: any[]): { [p: string]: any } {
    const o : EntityDTO<this> = wrap(this, true).toObject(...args); // do not forget to pass rest params here

    return { url: o['image']['imgPath'], thumbnailUrl: o['thumbnail']['imgPath'] };
  }
}
