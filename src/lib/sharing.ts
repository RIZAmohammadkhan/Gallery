// Server-side sharing utility functions for image galleries

import { generateShareId } from './sharing-client';
import type { SharedGallery } from './sharing-client';

export type { SharedGallery };
export { generateShareId };

export async function createSharedGallery(
  userId: string,
  title: string,
  images: Array<{ id: string; name: string; dataUri: string }>,
  expirationDays?: number
): Promise<string | null> {
  // This function should only be called from server-side (API routes)
  const { DatabaseService } = await import('./database');
  
  const shareId = generateShareId();
  const now = new Date();
  const expiresAt = expirationDays 
    ? new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000)
    : undefined;

  const galleryData = {
    id: shareId,
    title,
    imageIds: images.map(img => img.id),
    imageData: images, // Store the complete image data for persistent sharing
    expiresAt,
    accessCount: 0,
    isActive: true,
  };

  const result = await DatabaseService.createSharedGallery(userId, galleryData);
  return result;
}

export async function getSharedGallery(shareId: string): Promise<SharedGallery | null> {
  try {
    const { DatabaseService } = await import('./database');
    const gallery = await DatabaseService.getSharedGallery(shareId);
    return gallery;
  } catch (error) {
    console.error('Error fetching shared gallery:', error);
    return null;
  }
}

export async function deleteSharedGallery(userId: string, shareId: string): Promise<boolean> {
  try {
    const { DatabaseService } = await import('./database');
    return await DatabaseService.deleteSharedGallery(userId, shareId);
  } catch (error) {
    console.error('Error deleting shared gallery:', error);
    return false;
  }
}

export async function listSharedGalleries(userId: string): Promise<SharedGallery[]> {
  try {
    const { DatabaseService } = await import('./database');
    return await DatabaseService.getUserSharedGalleries(userId);
  } catch (error) {
    console.error('Error fetching shared galleries:', error);
    return [];
  }
}

export async function cleanupExpiredGalleries(): Promise<number> {
  try {
    const { DatabaseService } = await import('./database');
    return await DatabaseService.cleanupExpiredGalleries();
  } catch (error) {
    console.error('Error cleaning up expired galleries:', error);
    return 0;
  }
}
