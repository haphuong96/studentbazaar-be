import { Image } from 'src/modules/img/image.entity';
import { Transform } from 'class-transformer';

export class CreateItemDto {
  itemName: string;
  itemDescription?: string;
  categoryId: number;
  conditionId?: number;
  price?: number;
  img: {
    image: Image;
    thumbnail: Image;
  }[];
}

export class SearchItemDto {
  @Transform(({ value }) => parseInt(value))
  limit?: number;
  @Transform(({ value }) => parseInt(value))
  offset?: number;
  @Transform(({ value }) => parseInt(value))
  nextCursor?: number;
  q?: string;
  @Transform(({ value }) => parseInt(value))
  categoryId?: number;
}
