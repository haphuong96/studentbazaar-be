import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  OneToMany,
} from '@mikro-orm/core';
import { Item } from './item.entity';
import { RecursiveRelationEntity } from 'src/utils/nest-children-entities.util';

@Entity()
export class ItemCategory implements RecursiveRelationEntity<ItemCategory> {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  categoryName!: string;

  @ManyToOne()
  parent?: ItemCategory;

  @OneToMany({ mappedBy: 'category' })
  item?: Item;

  @Property({ persist: false })
  children: ItemCategory[];

}
