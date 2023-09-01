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
import { AzureStorageBlob } from '../../azure-blob-storage/blob.entity';

@Entity()
export class ItemImage {
  @PrimaryKey()
  id!: number;

  @OneToOne()
  image!: AzureStorageBlob;

  @OneToOne()
  thumbnail!: AzureStorageBlob;

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
