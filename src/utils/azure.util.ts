export const azureURLGenerator = (resource: {
  storageAccountName?: string;
  containerName?: string;
  blobName?: string;
}) => {
  const { storageAccountName, containerName, blobName } = resource;
  return (
    `https://${storageAccountName}.blob.core.windows.net` +
    `${containerName ? '/' + containerName : ''}` +
    `${containerName && blobName ? '/' + blobName : ''}`
  );
};
