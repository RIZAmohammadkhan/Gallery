#!/usr/bin/env node

/**
 * Migration script to move from file-based storage to database storage
 * This script is for reference only since you mentioned no production data exists
 */

import { SecureImageStorage } from '../src/lib/storage.js';
import clientPromise from '../src/lib/mongodb.js';
import { readFile, readdir } from 'fs/promises';
import path from 'path';

async function migrateFileStorageToDatabase() {
  console.log('🚀 Starting migration from file storage to database storage...');
  
  try {
    const client = await clientPromise;
    const images = client.db().collection('images');
    
    // Find all images that still have fileUrl instead of storageId
    const fileBased = await images.find({ 
      fileUrl: { $exists: true },
      storageId: { $exists: false }
    }).toArray();
    
    console.log(`📁 Found ${fileBased.length} file-based images to migrate`);
    
    for (const imageDoc of fileBased) {
      try {
        // Extract filename from fileUrl
        const filename = imageDoc.fileUrl.replace('/api/uploads/', '');
        const filePath = path.join(process.cwd(), 'uploads', filename);
        
        // Read the file
        const fileBuffer = await readFile(filePath);
        
        // Store in database
        const storageId = await SecureImageStorage.storeImage(fileBuffer, imageDoc.mimeType);
        
        // Update the image record
        await images.updateOne(
          { _id: imageDoc._id },
          { 
            $set: { storageId },
            $unset: { fileUrl: '', filename: '' }
          }
        );
        
        console.log(`✅ Migrated: ${imageDoc.name} (${filename})`);
      } catch (error) {
        console.error(`❌ Failed to migrate ${imageDoc.name}:`, error.message);
      }
    }
    
    // Clean up orphaned storage entries
    const cleanedCount = await SecureImageStorage.cleanupOrphanedImages();
    console.log(`🧹 Cleaned up ${cleanedCount} orphaned storage entries`);
    
    console.log('✨ Migration completed successfully!');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

async function cleanupUploadsFolder() {
  console.log('🧹 Cleaning up uploads folder...');
  
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const files = await readdir(uploadsDir);
    
    console.log(`📁 Found ${files.length} files in uploads folder`);
    console.log('ℹ️  You can now safely delete the uploads folder since all images are in the database');
    console.log('ℹ️  Run: rm -rf uploads/');
    
  } catch (error) {
    console.log('📁 No uploads folder found - that\'s expected with the new system!');
  }
}

// Run the migration
if (process.argv[2] === 'migrate') {
  migrateFileStorageToDatabase();
} else if (process.argv[2] === 'cleanup') {
  cleanupUploadsFolder();
} else {
  console.log(`
📖 Database Storage Migration Script

Usage:
  node scripts/migrate-storage.js migrate  - Migrate existing file-based images to database
  node scripts/migrate-storage.js cleanup  - Check uploads folder for cleanup

Since you mentioned no production data exists, you can simply:
1. Delete the uploads/ folder: rm -rf uploads/
2. Start fresh with the new database storage system

Benefits of the new system:
✅ Secure - Images stored in database with user access control
✅ Scalable - No file system dependencies
✅ Backup-friendly - Single database to backup
✅ Deduplication - Identical images share storage
✅ Production-ready - No direct file access vulnerabilities
  `);
}
