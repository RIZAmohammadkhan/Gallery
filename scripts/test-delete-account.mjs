#!/usr/bin/env node
/**
 * Test script to verify delete account functionality
 * This script tests the database operations without making HTTP requests
 */

import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gallery';

async function testDeleteAccountOperation() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Create a test user and associated data
    const testUserId = new ObjectId();
    const testUserEmail = 'test-delete@example.com';
    
    console.log(`🧪 Creating test data for user: ${testUserId}`);
    
    // Insert test user
    await db.collection('users').insertOne({
      _id: testUserId,
      email: testUserEmail,
      name: 'Test User',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Insert test images
    await db.collection('images').insertMany([
      {
        userId: testUserId,
        id: 'test-image-1',
        name: 'Test Image 1',
        storageId: 'storage-1',
        mimeType: 'image/jpeg',
        size: 1024,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: testUserId,
        id: 'test-image-2',
        name: 'Test Image 2',
        storageId: 'storage-2',
        mimeType: 'image/png',
        size: 2048,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    
    // Insert test folders
    await db.collection('folders').insertOne({
      userId: testUserId,
      id: 'test-folder-1',
      name: 'Test Folder',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Insert test shared galleries
    await db.collection('shared_galleries').insertOne({
      userId: testUserId,
      id: 'test-gallery-1',
      title: 'Test Gallery',
      images: [],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true
    });
    
    // Insert test user settings
    await db.collection('user_settings').insertOne({
      userId: testUserId,
      settings: { geminiApiKey: 'test-key' },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Insert test image storage
    await db.collection('image_storage').insertMany([
      {
        userId: testUserId,
        id: 'storage-1',
        data: 'base64imagedata1',
        mimeType: 'image/jpeg',
        createdAt: new Date()
      },
      {
        userId: testUserId,
        id: 'storage-2',
        data: 'base64imagedata2',
        mimeType: 'image/png',
        createdAt: new Date()
      }
    ]);
    
    console.log('✅ Test data created');
    
    // Verify test data exists
    const userCount = await db.collection('users').countDocuments({ _id: testUserId });
    const imageCount = await db.collection('images').countDocuments({ userId: testUserId });
    const folderCount = await db.collection('folders').countDocuments({ userId: testUserId });
    const galleryCount = await db.collection('shared_galleries').countDocuments({ userId: testUserId });
    const settingsCount = await db.collection('user_settings').countDocuments({ userId: testUserId });
    const storageCount = await db.collection('image_storage').countDocuments({ userId: testUserId });
    
    console.log(`📊 Data before deletion:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Images: ${imageCount}`);
    console.log(`   Folders: ${folderCount}`);
    console.log(`   Galleries: ${galleryCount}`);
    console.log(`   Settings: ${settingsCount}`);
    console.log(`   Storage: ${storageCount}`);
    
    // Simulate the delete account operation
    console.log('🗑️  Simulating account deletion...');
    
    const session = client.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Delete all user's data (same logic as the API)
        const imagesResult = await db.collection('images').deleteMany({ userId: testUserId });
        const storageResult = await db.collection('image_storage').deleteMany({ userId: testUserId });
        const foldersResult = await db.collection('folders').deleteMany({ userId: testUserId });
        const galleriesResult = await db.collection('shared_galleries').deleteMany({ userId: testUserId });
        const settingsResult = await db.collection('user_settings').deleteMany({ userId: testUserId });
        const userResult = await db.collection('users').deleteOne({ email: testUserEmail });
        
        console.log(`📊 Deletion results:`);
        console.log(`   Images deleted: ${imagesResult.deletedCount}`);
        console.log(`   Storage deleted: ${storageResult.deletedCount}`);
        console.log(`   Folders deleted: ${foldersResult.deletedCount}`);
        console.log(`   Galleries deleted: ${galleriesResult.deletedCount}`);
        console.log(`   Settings deleted: ${settingsResult.deletedCount}`);
        console.log(`   User deleted: ${userResult.deletedCount}`);
        
        if (userResult.deletedCount === 0) {
          throw new Error('User account not found or could not be deleted');
        }
      });
    } finally {
      await session.endSession();
    }
    
    // Verify all data is deleted
    const finalUserCount = await db.collection('users').countDocuments({ _id: testUserId });
    const finalImageCount = await db.collection('images').countDocuments({ userId: testUserId });
    const finalFolderCount = await db.collection('folders').countDocuments({ userId: testUserId });
    const finalGalleryCount = await db.collection('shared_galleries').countDocuments({ userId: testUserId });
    const finalSettingsCount = await db.collection('user_settings').countDocuments({ userId: testUserId });
    const finalStorageCount = await db.collection('image_storage').countDocuments({ userId: testUserId });
    
    console.log(`📊 Data after deletion:`);
    console.log(`   Users: ${finalUserCount}`);
    console.log(`   Images: ${finalImageCount}`);
    console.log(`   Folders: ${finalFolderCount}`);
    console.log(`   Galleries: ${finalGalleryCount}`);
    console.log(`   Settings: ${finalSettingsCount}`);
    console.log(`   Storage: ${finalStorageCount}`);
    
    // Check if deletion was successful
    const totalRemaining = finalUserCount + finalImageCount + finalFolderCount + finalGalleryCount + finalSettingsCount + finalStorageCount;
    
    if (totalRemaining === 0) {
      console.log('✅ DELETE ACCOUNT TEST PASSED: All user data successfully deleted');
    } else {
      console.log('❌ DELETE ACCOUNT TEST FAILED: Some data was not deleted');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

console.log('🧪 Starting Delete Account Functionality Test...');
testDeleteAccountOperation();
