import { MAX_IMAGE_DIMENSION_PX, JPEG_COMPRESSION_QUALITY } from '../constants';

/**
 * Resizes an image file to a maximum dimension and returns its base64 data (JPEG).
 * @param file The image file to resize.
 * @returns A Promise that resolves with the base64 encoded image data (without prefix).
 */
export const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target?.result) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions to fit within MAX_IMAGE_DIMENSION_PX while maintaining aspect ratio
          if (width > MAX_IMAGE_DIMENSION_PX || height > MAX_IMAGE_DIMENSION_PX) {
            if (width > height) {
              height *= MAX_IMAGE_DIMENSION_PX / width;
              width = MAX_IMAGE_DIMENSION_PX;
            } else {
              width *= MAX_IMAGE_DIMENSION_PX / height;
              height = MAX_IMAGE_DIMENSION_PX;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Get base64 data without prefix, always convert to JPEG
            resolve(canvas.toDataURL('image/jpeg', JPEG_COMPRESSION_QUALITY).split(',')[1]);
          } else {
            reject(new Error("Failed to get canvas 2D context."));
          }
        };
        img.onerror = () => reject(new Error("Failed to load image for resizing."));
        img.src = event.target.result as string;
      } else {
        reject(new Error("FileReader result is null."));
      }
    };
    reader.onerror = () => reject(new Error("FileReader failed to read the file."));
    reader.readAsDataURL(file);
  });
};

/**
 * Downloads a base64 image URL to the user's computer.
 * @param imageUrl The base64 data URL of the image.
 * @param filename The desired filename for the downloaded image (without extension).
 */
export const downloadImage = (imageUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.png`; // Add date and .png extension
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};