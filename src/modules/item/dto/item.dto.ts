import { AzureStorageBlob } from 'src/modules/azure-blob-storage/blob.entity';
import { Transform } from 'class-transformer';
import { ItemStatus } from '../entities/item.entity';

export class CreateItemDto {
  itemName: string;
  itemDescription?: string;
  categoryId: number;
  conditionId?: number;
  price?: number;
  img: {
    imageId: number;
    thumbnailId: number;
  }[];
  locationId: number;
  status: ItemStatus;
}

export class UpdateItemDto {
  status?: ItemStatus;
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
  @Transform(({ value }) => parseInt(value))
  campusId?: number;
  @Transform(({ value }) => parseInt(value))
  universityId?: number;
  @Transform(({ value }) => parseInt(value))
  ownerId?: number;
}
