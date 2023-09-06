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
  constructor(configService: ConfigService) {
    super(
      configService.get<string>('azureBlobStorage.urlContainer'),
      new DefaultAzureCredential()
    );
    this.createIfNotExists({
      access: 'blob'
    });
  }
}
