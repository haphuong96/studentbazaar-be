import {
  types,
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
} from '@mikro-orm/core';

@Entity()
export class Image {
  @PrimaryKey()
  id!: number;

  @Property({ type: types.text })
  imgPath!: string;
}
