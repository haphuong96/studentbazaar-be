import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  OneToMany,
  Unique,
} from '@mikro-orm/core';
import { Item } from './item.entity';
import { RecursiveRelationEntity } from 'src/utils/nest-children-entities.util';

@Entity()
@Unique({ properties: ['path'] })
export class ItemCategory implements RecursiveRelationEntity<ItemCategory> {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255 })
  categoryName!: string;

  @Property()
  path = this.categoryName.toLowerCase().replace(' ', '-');

  @ManyToOne()
  parent?: ItemCategory;

  @Property({ persist: false })
  children: ItemCategory[];
}
