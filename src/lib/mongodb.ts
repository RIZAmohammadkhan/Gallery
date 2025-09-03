import { MongoClient, MongoClientOptions } from 'mongodb';

// Allow build without MongoDB URI (for Docker builds)
const uri = process.env.MONGODB_URI;

if (!uri && process.env.NODE_ENV !== 'production') {
  console.warn('MongoDB URI not found. Some features may not work.');
}

// Default options for MongoDB connection
const options: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
  // No SSL/TLS configuration needed for local MongoDB
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Only create MongoDB connection if URI is available
if (uri) {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise!;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  // Create a dummy promise for build-time scenarios
  clientPromise = Promise.reject(new Error('MongoDB URI not configured'));
}

export default clientPromise;
