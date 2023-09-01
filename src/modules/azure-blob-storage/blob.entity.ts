import {
  types,
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Enum,
} from '@mikro-orm/core';
import { ConfigService } from '@nestjs/config';
import { azureURLGenerator } from 'src/utils/azure.util';

@Entity()
export class AzureStorageBlob {
  @PrimaryKey()
  id!: number;

  @Property({
    type: types.text,
    serializer: (value) =>
      azureURLGenerator({
        storageAccountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
        containerName: process.env.AZURE_STORAGE_IMAGE_CONTAINER_NAME,
        blobName: value,
      }),
      serializedName: 'imgPath'
  })
  blobName!: string;
}
