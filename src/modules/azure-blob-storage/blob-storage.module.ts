import { Module } from '@nestjs/common';
import { PJAzureBlobServiceClient } from './blob-service-client';
import { ImageBlockBlobClientService } from './img-block-blob-client.service';

@Module({
  providers: [
    PJAzureBlobServiceClient,
    ImageBlockBlobClientService,
  ],
  exports: [
    PJAzureBlobServiceClient,
    ImageBlockBlobClientService,
  ]
})
export class AzureBlobStorageClientModule {}
