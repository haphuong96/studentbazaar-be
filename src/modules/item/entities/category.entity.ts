import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  OneToMany,
} from '@mikro-orm/core';
import { Item } from './item.entity';

@Entity()
export class ItemCategory {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  categoryName!: string;

  @ManyToOne()
  parentCategory?: ItemCategory;

  @OneToMany({ mappedBy: 'category' })
  item?: Item;
}
