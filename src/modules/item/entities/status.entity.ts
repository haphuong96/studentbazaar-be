import { Entity, PrimaryKey, Property, OneToMany } from '@mikro-orm/core';
import { Item } from './item.entity';

@Entity()
export class ItemStatus {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255, unique: true })
  statusCode!: string;

  @Property({ length: 255 })
  statusName!: string;

  @OneToMany({ mappedBy: 'status' })
  item?: Item;
}
