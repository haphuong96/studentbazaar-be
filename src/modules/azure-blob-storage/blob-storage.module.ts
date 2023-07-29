import { Module } from '@nestjs/common';
import { ImageBlockBlobClientService } from './img-block-blob-client.service';
import { AzureBlobStorageManagerService } from './blob-storage-manager.service';

@Module({
  providers: [
    ImageBlockBlobClientService,
    AzureBlobStorageManagerService
  ],
  exports: [
    ImageBlockBlobClientService,
    AzureBlobStorageManagerService
  ]
})
export class AzureBlobStorageClientModule {}
