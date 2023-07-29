import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AzureBlobStorageManagerService } from './blob-storage-manager.service';
import { ConfigService } from '@nestjs/config';
import { ContainerClient } from '@azure/storage-blob';

@Injectable()
export class ImageContainerClientService {
  constructor(
    private configService: ConfigService,
    private blobStorageManager: AzureBlobStorageManagerService,
  ) {}

  getBlockBlobClient(imgName: string) {
    const containerClient: ContainerClient =
      this.blobStorageManager.getContainerClient(
        this.configService.get<string>('azureBlobStorage.imageContainerName'),
      );

    if (!containerClient) {
      throw new Error('Container client is undefined');
    }

    return containerClient.getBlockBlobClient(imgName + '_' + randomUUID());
  }
}
