import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AzureImageContainerClient } from './container-client';
import { ConfigService } from '@nestjs/config';
import {
  BlobUploadCommonResponse,
  BlockBlobClient,
  ContainerClient,
} from '@azure/storage-blob';
import { resizeImageFromBuffer } from 'src/utils/img-resize.util';
import { FileUploadResponse } from './azure.interface';

@Injectable()
export class ImageBlobClientService {
  constructor(
    private configService: ConfigService,
    private containerClient: AzureImageContainerClient,
  ) {}

  getBlockBlobClient(blobName: string) {
    return this.containerClient.getBlockBlobClient(blobName);
  }

  /**
   * Upload an image and thumbnails to azure blob storage. Return null if any upload failed.
   * @param file 
   * @param thumbnails 
   * @returns 
   */
  async uploadImage(
    file: Express.Multer.File,
    thumbnails: [{ height?: number; width?: number }],
  ): Promise<
    | {
        imageUpload: FileUploadResponse;
        thumbnailUploads: FileUploadResponse[];
      }
    | null
  > {
    // prepare and upload image and its thumbnails
    const imageUpload: FileUploadResponse = {
      blobName: file.originalname,
      upload: await this.getBlockBlobClient(file.originalname).uploadData(
        file.buffer,
        {
          blobHTTPHeaders: {
            blobContentType: file.mimetype,
          },
        },
      ),
    };

    // if image upload failed, return
    if (imageUpload.upload._response.status !== 201) {
      return null;
    }

    const thumbnailUploads: FileUploadResponse[] = await Promise.all(
      thumbnails.map(async (thumbnail) => {
        const thumbnailBuffer: Buffer = await resizeImageFromBuffer(
          file.buffer,
          thumbnail.height || thumbnail.width,
          !!thumbnail.height,
        );
        const blockBlobClient = this.getBlockBlobClient(
          this.getBlobName(
            file.originalname,
            thumbnail.height,
            thumbnail.width,
          ),
        );
        return {
          blobName: blockBlobClient.name,
          upload: await blockBlobClient.uploadData(thumbnailBuffer, {
            blobHTTPHeaders: {
              blobContentType: file.mimetype,
            },
          }),
        };
      }),
    );
    
    // if any thumbnail upload failed, return
    thumbnailUploads.forEach((thumbnailUpload) => {
      if (thumbnailUpload.upload._response.status !== 201) {
        return null;
      }
    });

    return { imageUpload, thumbnailUploads };
  }

  getBlobName(imgName: string, resizeHeight?: number, resizeWidth?: number) {
    return (
      imgName +
      '/' +
      `${resizeWidth ? resizeWidth : 'f'}x${
        resizeHeight ? resizeHeight : 'f'
      }` +
      '/' +
      randomUUID()
    );
  }
}
