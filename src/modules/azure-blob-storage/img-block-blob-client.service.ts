import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AzureBlobStorageManagerService } from './blob-storage-manager.service';
import { ConfigService } from '@nestjs/config';
import { ContainerClient } from '@azure/storage-blob';

@Injectable()
export class ImageBlockBlobClientService {
  constructor(
    private configService: ConfigService,
    private blobStorageManager: AzureBlobStorageManagerService,
  ) {}

  getBlockBlobClient(blobName: string) {
    const containerClient: ContainerClient =
      this.blobStorageManager.getContainerClient(
        this.configService.get<string>('azureBlobStorage.imageContainerName'),
      );

    if (containerClient.containerName === 'undefined') {
      throw new Error('Container client is undefined');
    }

    return containerClient.getBlockBlobClient(blobName + '_' + randomUUID());
  }
}
