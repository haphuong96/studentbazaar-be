import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-client-management?tabs=javascript
 * Create a container client that stores images as a singleton.
 */
@Injectable()
export class AzureImageContainerClient extends ContainerClient {
  // private blobServiceClient: BlobServiceClient;
  // private containerClients: Map<string, ContainerClient>;

  // constructor(private configService: ConfigService) {
  //   this.blobServiceClient = new BlobServiceClient(
  //     `https://${configService.get<string>(
  //       'azureBlobStorage.storageAccountName',
  //     )}.blob.core.windows.net`,
  //     new DefaultAzureCredential(),
  //   );
  //   this.setContainerClients();
  // }
  constructor(configService: ConfigService) {
    super(
      configService.get<string>('azureBlobStorage.urlContainer'),
      new DefaultAzureCredential()
    );
    this.createIfNotExists();
  }

  // /**
  //  * Instantiate container clients
  //  */
  // private setContainerClients() {
  //   const map: Map<string, ContainerClient> = new Map<
  //     string,
  //     ContainerClient
  //   >();

  //   // set image container client
  //   const imgContainerName: string = this.configService.get<string>(
  //     'azureBlobStorage.imageContainerName',
  //   );

  //   map.set(
  //     imgContainerName,
  //     this.blobServiceClient.getContainerClient(imgContainerName),
  //   );

  //   // create image container if not exist
  //   map.get(imgContainerName).createIfNotExists();

  //   this.containerClients = map;
  // }

  // getContainerClient(containerName: string): ContainerClient {
  //   return this.containerClients.get(containerName);
  // }

  // getBlobServiceClient(): BlobServiceClient {
  //   return this.blobServiceClient;
  // }
}
