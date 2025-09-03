import { StoredImage } from './types';
import JSZip from 'jszip';

/**
 * Downloads a single image from a data URI
 */
export function downloadImage(dataUri: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Converts a data URI to a blob
 */
function dataUriToBlob(dataUri: string): Blob {
  const byteString = atob(dataUri.split(',')[1]);
  const mimeString = dataUri.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeString });
}

/**
 * Gets file extension from data URI or defaults to jpg
 */
function getFileExtension(dataUri: string): string {
  const mimeType = dataUri.split(',')[0].split(':')[1].split(';')[0];
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/gif':
      return 'gif';
    case 'image/webp':
      return 'webp';
    case 'image/jpeg':
    case 'image/jpg':
    default:
      return 'jpg';
  }
}

/**
 * Sanitizes filename to be safe for download
 */
function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9\-_\.]/gi, '_');
}

/**
 * Exports multiple images as a ZIP file
 */
export async function exportImagesAsZip(
  images: StoredImage[],
  onProgress?: (progress: number) => void
): Promise<void> {
  if (images.length === 0) return;

  const zip = new JSZip();
  const total = images.length;
  let processed = 0;

  // Add each image to the zip
  for (const image of images) {
    try {
      const blob = dataUriToBlob(image.dataUri);
      const extension = getFileExtension(image.dataUri);
      const sanitizedName = sanitizeFilename(image.name);
      const filename = sanitizedName.includes('.') 
        ? sanitizedName 
        : `${sanitizedName}.${extension}`;
      
      zip.file(filename, blob);
      processed++;
      
      if (onProgress) {
        onProgress((processed / total) * 100);
      }
    } catch (error) {
      console.error(`Failed to add image ${image.name} to zip:`, error);
      processed++;
      if (onProgress) {
        onProgress((processed / total) * 100);
      }
    }
  }

  try {
    // Generate the zip file
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    // Create download link
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `gallery_export_${timestamp}.zip`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to generate zip file:', error);
    throw new Error('Failed to create ZIP file');
  }
}

/**
 * Exports a single image
 */
export function exportSingleImage(image: StoredImage): void {
  const extension = getFileExtension(image.dataUri);
  const sanitizedName = sanitizeFilename(image.name);
  const filename = sanitizedName.includes('.') 
    ? sanitizedName 
    : `${sanitizedName}.${extension}`;
  
  downloadImage(image.dataUri, filename);
}
