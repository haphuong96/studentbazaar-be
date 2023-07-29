import { Module } from '@nestjs/common';
import { ImageContainerClientService } from './img-container-client.service';
import { AzureBlobStorageManagerService } from './blob-storage-manager.service';

@Module({
  providers: [
    ImageContainerClientService,
    AzureBlobStorageManagerService
  ],
  exports: [
    ImageContainerClientService,
    AzureBlobStorageManagerService
  ]
})
export class AzureBlobStorageClientModule {}
