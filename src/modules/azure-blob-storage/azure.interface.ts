import { BlobUploadCommonResponse } from "@azure/storage-blob";

export interface FileUploadResponse {
  blobName: string;
  upload: BlobUploadCommonResponse;
}
