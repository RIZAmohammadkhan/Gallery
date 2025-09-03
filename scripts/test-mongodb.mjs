#!/usr/bin/env node

/**
 * MongoDB Connection Test Script
 * Run this to test your MongoDB connection before starting the app
 */

import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

// Load environment variables
config();

async function testConnection() {
  console.log('🔌 Testing MongoDB connection...');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  console.log(`📡 Connecting to: ${process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    // No SSL needed for local MongoDB
  });

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');

    // Test database access
    const db = client.db();
    await db.admin().ping();
    console.log('✅ Database ping successful');

    // Test collections access
    const collections = await db.collections();
    console.log(`📊 Database has ${collections.length} collections`);

    // Test inserting a test document
    const testCollection = db.collection('connection_test');
    const testDoc = { test: true, timestamp: new Date() };
    const result = await testCollection.insertOne(testDoc);
    console.log('✅ Test document inserted successfully');

    // Clean up test document
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Test document cleaned up');

    console.log('🎉 All MongoDB tests passed! Your database is ready.');

  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    
    if (error instanceof Error) {
      if (error.message.includes('MongoServerSelectionError')) {
        console.error('   - Cannot reach MongoDB server');
        console.error('   - Check your connection string and network access');
      } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
        console.error('   - SSL/TLS connection error');
        console.error('   - Check if your MongoDB instance requires SSL');
      } else if (error.message.includes('authentication')) {
        console.error('   - Authentication failed');
        console.error('   - Check your username and password');
      } else {
        console.error(`   - ${error.message}`);
      }
    }
    
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Check your MONGODB_URI in .env file');
    console.error('   2. Ensure your IP is whitelisted in MongoDB Atlas');
    console.error('   3. Verify your username and password');
    console.error('   4. Check if your cluster is running');
    
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run the test
testConnection();
