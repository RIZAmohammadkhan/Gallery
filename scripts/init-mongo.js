// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Create the application database if it doesn't exist
db = db.getSiblingDB('studio-gallery');

// Create collections that your app might need
db.createCollection('users');
db.createCollection('images');
db.createCollection('folders');
db.createCollection('settings');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.images.createIndex({ "userId": 1 });
db.images.createIndex({ "folderId": 1 });
db.folders.createIndex({ "userId": 1 });

print('Database studio-gallery initialized successfully with collections and indexes');
