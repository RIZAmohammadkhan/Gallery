import clientPromise from '@/lib/mongodb';
import { DbStoredImage, DbFolder, DbSharedGallery } from '@/lib/models';
import { StoredImage, Folder } from '@/lib/types';
import { ObjectId } from 'mongodb';

export class DatabaseService {
  // Images
  static async getUserImages(userId: string): Promise<StoredImage[]> {
    try {
      const client = await clientPromise;
      const images = client.db().collection('images');
      const userImages = await images.find({ userId: new ObjectId(userId) }).toArray();
      
      return userImages.map((img: any) => this.dbImageToStoredImage(img));
    } catch (error) {
      console.error('Error fetching user images:', error);
      return [];
    }
  }

  static async createImage(userId: string, imageData: Omit<DbStoredImage, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<StoredImage | null> {
    try {
      const client = await clientPromise;
      const images = client.db().collection('images');
      const now = new Date();
      
      const newImage = {
        ...imageData,
        userId: new ObjectId(userId),
        createdAt: now,
        updatedAt: now,
      };

      const result = await images.insertOne(newImage);
      const inserted = await images.findOne({ _id: result.insertedId });
      
      return inserted ? this.dbImageToStoredImage(inserted as any) : null;
    } catch (error) {
      console.error('Error creating image:', error);
      return null;
    }
  }

  static async updateImage(userId: string, imageId: string, updates: Partial<DbStoredImage>): Promise<boolean> {
    try {
      const client = await clientPromise;
      const images = client.db().collection('images');
      const result = await images.updateOne(
        { userId: new ObjectId(userId), id: imageId },
        { $set: { ...updates, updatedAt: new Date() } }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating image:', error);
      return false;
    }
  }

  static async deleteImage(userId: string, imageId: string): Promise<boolean> {
    try {
      const client = await clientPromise;
      const images = client.db().collection('images');
      const result = await images.deleteOne({ userId: new ObjectId(userId), id: imageId });
      
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  // Folders
  static async getUserFolders(userId: string): Promise<Folder[]> {
    try {
      const client = await clientPromise;
      const folders = client.db().collection('folders');
      const userFolders = await folders.find({ userId: new ObjectId(userId) }).toArray();
      
      return userFolders.map((folder: any) => this.dbFolderToFolder(folder));
    } catch (error) {
      console.error('Error fetching user folders:', error);
      return [];
    }
  }

  static async createFolder(userId: string, folderData: Omit<DbFolder, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Folder | null> {
    try {
      const client = await clientPromise;
      const folders = client.db().collection('folders');
      const now = new Date();
      
      const newFolder = {
        ...folderData,
        userId: new ObjectId(userId),
        createdAt: now,
        updatedAt: now,
      };

      const result = await folders.insertOne(newFolder);
      const inserted = await folders.findOne({ _id: result.insertedId });
      
      return inserted ? this.dbFolderToFolder(inserted as any) : null;
    } catch (error) {
      console.error('Error creating folder:', error);
      return null;
    }
  }

  static async deleteFolder(userId: string, folderId: string): Promise<boolean> {
    try {
      const client = await clientPromise;
      
      // First, move all images in this folder to uncategorized
      const images = client.db().collection('images');
      await images.updateMany(
        { userId: new ObjectId(userId), folderId },
        { $set: { folderId: null, updatedAt: new Date() } }
      );

      // Then delete the folder
      const folders = client.db().collection('folders');
      const result = await folders.deleteOne({ userId: new ObjectId(userId), id: folderId });
      
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting folder:', error);
      return false;
    }
  }

  // Shared Galleries
  static async createSharedGallery(userId: string, galleryData: Omit<DbSharedGallery, '_id' | 'userId' | 'createdAt'>): Promise<string | null> {
    try {
      const client = await clientPromise;
      const galleries = client.db().collection('shared_galleries');
      
      const newGallery = {
        ...galleryData,
        userId: new ObjectId(userId),
        createdAt: new Date(),
      };

      const result = await galleries.insertOne(newGallery);
      return result.insertedId ? galleryData.id : null;
    } catch (error) {
      console.error('Error creating shared gallery:', error);
      return null;
    }
  }

  static async getSharedGallery(shareId: string): Promise<any | null> {
    try {
      const client = await clientPromise;
      const galleries = client.db().collection('shared_galleries');
      const gallery = await galleries.findOne({ id: shareId, isActive: true });
      
      if (!gallery) return null;

      // Check if expired
      if (gallery.expiresAt && gallery.expiresAt < new Date()) {
        await galleries.updateOne(
          { _id: gallery._id },
          { $set: { isActive: false } }
        );
        return null;
      }

      // Increment access count
      await galleries.updateOne(
        { _id: gallery._id },
        { $inc: { accessCount: 1 } }
      );

      // Use stored image data instead of fetching from images collection
      // This ensures the shared images are always available even if original images are deleted
      return {
        id: gallery.id,
        title: gallery.title,
        images: gallery.imageData || [], // Use stored image data
        createdAt: gallery.createdAt,
        expiresAt: gallery.expiresAt,
        accessCount: gallery.accessCount + 1,
      };
    } catch (error) {
      console.error('Error fetching shared gallery:', error);
      return null;
    }
  }

  static async deleteSharedGallery(userId: string, shareId: string): Promise<boolean> {
    try {
      const client = await clientPromise;
      const galleries = client.db().collection('shared_galleries');
      const result = await galleries.deleteOne({ 
        userId: new ObjectId(userId), 
        id: shareId 
      });
      
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting shared gallery:', error);
      return false;
    }
  }

  static async getUserSharedGalleries(userId: string): Promise<any[]> {
    try {
      const client = await clientPromise;
      const galleries = client.db().collection('shared_galleries');
      const userGalleries = await galleries.find({ 
        userId: new ObjectId(userId),
        isActive: true 
      }).toArray();
      
      const result = [];
      
      for (const gallery of userGalleries) {
        // Check if expired
        if (gallery.expiresAt && gallery.expiresAt < new Date()) {
          // Mark as inactive instead of deleting
          await galleries.updateOne(
            { _id: gallery._id },
            { $set: { isActive: false } }
          );
          continue;
        }

        // Use stored image data instead of fetching from images collection
        // This ensures shared galleries work even if original images are deleted
        result.push({
          id: gallery.id,
          title: gallery.title,
          images: gallery.imageData || [], // Use stored image data
          createdAt: gallery.createdAt,
          expiresAt: gallery.expiresAt,
          accessCount: gallery.accessCount,
        });
      }
      
      return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching user shared galleries:', error);
      return [];
    }
  }

  static async cleanupExpiredGalleries(): Promise<number> {
    try {
      const client = await clientPromise;
      const galleries = client.db().collection('shared_galleries');
      const now = new Date();
      
      const result = await galleries.updateMany(
        { 
          expiresAt: { $lt: now },
          isActive: true 
        },
        { $set: { isActive: false } }
      );
      
      return result.modifiedCount;
    } catch (error) {
      console.error('Error cleaning up expired galleries:', error);
      return 0;
    }
  }

  // User Settings
  static async getUserSettings(userId: string): Promise<any> {
    try {
      const client = await clientPromise;
      const settings = client.db().collection('user_settings');
      const userSettings = await settings.findOne({ userId: new ObjectId(userId) });
      
      return userSettings ? userSettings.settings : null;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
  }

  static async updateUserSettings(userId: string, settingsData: any): Promise<boolean> {
    try {
      const client = await clientPromise;
      const settings = client.db().collection('user_settings');
      const now = new Date();
      
      const result = await settings.updateOne(
        { userId: new ObjectId(userId) },
        { 
          $set: { 
            settings: settingsData,
            updatedAt: now 
          },
          $setOnInsert: { 
            userId: new ObjectId(userId),
            createdAt: now 
          }
        },
        { upsert: true }
      );
      
      return result.acknowledged;
    } catch (error) {
      console.error('Error updating user settings:', error);
      return false;
    }
  }

  // Helper methods
  private static dbImageToStoredImage(dbImage: any): StoredImage {
    return {
      id: dbImage.id,
      name: dbImage.name,
      dataUri: dbImage.fileUrl,
      metadata: dbImage.metadata,
      tags: dbImage.tags,
      folderId: dbImage.folderId,
      isDefective: dbImage.isDefective,
      defectType: dbImage.defectType,
      width: dbImage.width,
      height: dbImage.height,
      data_ai_hint: dbImage.data_ai_hint,
    };
  }

  private static dbFolderToFolder(dbFolder: any): Folder {
    return {
      id: dbFolder.id,
      name: dbFolder.name,
    };
  }
}
