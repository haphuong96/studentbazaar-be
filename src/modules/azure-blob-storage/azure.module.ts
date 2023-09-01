import { Module } from '@nestjs/common';
import { ImageBlobClientService } from './blob-client.service';
import { AzureImageContainerClient } from './container-client';

@Module({
  providers: [
    ImageBlobClientService,
    AzureImageContainerClient
  ],
  exports: [
    ImageBlobClientService,
    AzureImageContainerClient
  ]
})
export class AzureBlobStorageModule {}
