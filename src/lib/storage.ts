import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import crypto from 'crypto';

export interface ImageStorage {
  _id?: ObjectId;
  id: string;
  data: Buffer;
  mimeType: string;
  size: number;
  checksum: string;
  createdAt: Date;
}

export class SecureImageStorage {
  /**
   * Store image data securely in database with deduplication
   */
  static async storeImage(
    imageBuffer: Buffer,
    mimeType: string
  ): Promise<string> {
    try {
      const checksum = this.generateChecksum(imageBuffer);
      const client = await clientPromise;
      const storage = client.db().collection('image_storage');

      // Check if image already exists (deduplication)
      const existing = await storage.findOne({ checksum });
      if (existing) {
        return existing.id;
      }

      const imageId = new ObjectId().toHexString();
      const imageData: ImageStorage = {
        id: imageId,
        data: imageBuffer,
        mimeType,
        size: imageBuffer.length,
        checksum,
        createdAt: new Date(),
      };

      await storage.insertOne(imageData);
      return imageId;
    } catch (error) {
      console.error('Error storing image:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('MongoServerSelectionError')) {
          throw new Error('Database connection failed. Please check your MongoDB connection.');
        } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
          throw new Error('Database SSL connection failed. Please check your MongoDB SSL configuration.');
        } else if (error.message.includes('authentication')) {
          throw new Error('Database authentication failed. Please check your MongoDB credentials.');
        }
      }
      
      throw new Error('Failed to store image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Retrieve image data from database
   */
  static async getImage(imageId: string): Promise<ImageStorage | null> {
    try {
      const client = await clientPromise;
      const storage = client.db().collection('image_storage');
      
      const image = await storage.findOne({ id: imageId });
      return image as ImageStorage | null;
    } catch (error) {
      console.error('Error retrieving image:', error);
      return null;
    }
  }

  /**
   * Delete image data from database
   */
  static async deleteImage(imageId: string): Promise<boolean> {
    try {
      const client = await clientPromise;
      const storage = client.db().collection('image_storage');
      
      const result = await storage.deleteOne({ id: imageId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  /**
   * Generate checksum for deduplication
   */
  static generateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Clean up orphaned images (images not referenced by any user)
   */
  static async cleanupOrphanedImages(): Promise<number> {
    try {
      const client = await clientPromise;
      const storage = client.db().collection('image_storage');
      const images = client.db().collection('images');

      // Find all image storage IDs that are not referenced in the images collection
      const referencedIds = await images.distinct('storageId');
      const result = await storage.deleteMany({
        id: { $nin: referencedIds }
      });

      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up orphaned images:', error);
      return 0;
    }
  }

  /**
   * Convert image buffer to data URI for frontend display
   */
  static bufferToDataUri(buffer: Buffer, mimeType: string): string {
    const base64 = buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }
}
