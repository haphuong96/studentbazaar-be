import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PJAzureBlobServiceClient extends BlobServiceClient {
  private imgContainerClient: ContainerClient;

  constructor(configService: ConfigService) {
    super(
      `https://${configService.get<string>(
        'azureBlobStorage.storageAccountName',
      )}.blob.core.windows.net`,
      new DefaultAzureCredential(),
    );

    this.imgContainerClient = this.setContainerClient(
      configService.get<string>('azureBlobStorage.imageContainerName'),
    );
  }

  private setContainerClient(containerName: string) {
    const containerClient: ContainerClient = this.getContainerClient(containerName);
    containerClient.createIfNotExists();
    return containerClient;
  }

  getImgContainerClient() {
    return this.imgContainerClient;
  }
}
