import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AzureBlobStorageManagerService {
  private blobServiceClient: BlobServiceClient;
  private containerClients: Map<string, ContainerClient>;

  constructor(private configService: ConfigService) {
    this.blobServiceClient = new BlobServiceClient(
      `https://${configService.get<string>(
        'azureBlobStorage.storageAccountName',
      )}.blob.core.windows.net`,
      new DefaultAzureCredential(),
    );
    this.setContainerClients();
  }

  private setContainerClients() {
    const map: Map<string, ContainerClient> = new Map<
      string,
      ContainerClient
    >();

    // set image container client
    const imgContainerName: string = this.configService.get<string>(
      'azureBlobStorage.imageContainerName',
    );

    map.set(
      imgContainerName,
      this.blobServiceClient.getContainerClient(imgContainerName),
    );

    // create image container if not exist
    map.get(imgContainerName).createIfNotExists();

    this.containerClients = map;
  }

  getContainerClient(containerName: string) : ContainerClient {
    return this.containerClients.get(containerName);
  }

  getBlobServiceClient() : BlobServiceClient {
    return this.blobServiceClient;
  }
}
