import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  name: string;
  password: string;
  image?: string;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbStoredImage {
  _id?: ObjectId;
  userId: ObjectId;
  id: string; // Frontend ID for compatibility
  name: string;
  filename: string; // Original filename
  fileUrl: string; // Storage URL
  mimeType: string;
  size: number;
  metadata?: string;
  tags?: string[];
  folderId?: string | null;
  isDefective?: boolean;
  defectType?: string;
  width?: number;
  height?: number;
  data_ai_hint?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbFolder {
  _id?: ObjectId;
  userId: ObjectId;
  id: string; // Frontend ID for compatibility
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbSharedGallery {
  _id?: ObjectId;
  userId: ObjectId;
  id: string; // Share ID
  title: string;
  imageIds: string[]; // Array of image IDs
  createdAt: Date;
  expiresAt?: Date;
  accessCount: number;
  isActive: boolean;
}

export interface Session {
  _id?: ObjectId;
  userId: ObjectId;
  sessionToken: string;
  expires: Date;
}
