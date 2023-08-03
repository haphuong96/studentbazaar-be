import sharp from 'sharp';

/**
 * Resize an image from a buffer by a given dimension. Default is height.
 * @param imageBuffer 
 * @param dimension 
 * @param isHeight 
 * @returns 
 */
export const resizeImageFromBuffer = async (
  imageBuffer: Buffer,
  dimension?: number,
  isHeight: boolean = true,
) => {
  try {
    const sharpImage = sharp(imageBuffer);
    // get dimensions of image
    const { width: imageWidth, height: imageHeight } =
      await sharpImage.metadata();

    const resizeHeight: number = isHeight
      ? dimension
      : Math.round((imageHeight / imageWidth) * dimension);

    const resizeWidth: number = isHeight
      ? Math.round((imageWidth / imageHeight) * dimension)
      : dimension;

    // Resize the image buffer using sharp
    const resizedImageBuffer = await sharpImage
      .resize(resizeWidth, resizeHeight)
      .toBuffer();

    // Return the resized image buffer
    return resizedImageBuffer;
  } catch (err) {
    console.error('Error resizing image:', err);
    throw err;
  }
};
