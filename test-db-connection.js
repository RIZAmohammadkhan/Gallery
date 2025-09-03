const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI not found in environment variables');
    return;
  }

  console.log('Testing MongoDB connection...');
  console.log('URI:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    // Test database access
    const db = client.db();
    await db.admin().ping();
    console.log('✅ Database ping successful');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
  } finally {
    await client.close();
  }
}

testConnection();
