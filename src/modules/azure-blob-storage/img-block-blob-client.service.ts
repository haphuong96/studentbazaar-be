import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PJAzureBlobServiceClient } from './blob-service-client';

@Injectable()
export class ImageBlockBlobClientService {
  constructor(private blobServiceClient: PJAzureBlobServiceClient) {}

  getBlockBlobClient(blobName: string) {
    return this.blobServiceClient
      .getImgContainerClient()
      .getBlockBlobClient(blobName + '_' + randomUUID());
  }
}
