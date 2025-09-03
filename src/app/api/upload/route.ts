import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { DbStoredImage } from '@/lib/models';
import { SecureImageStorage } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { ObjectId } from 'mongodb';

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process image with Sharp for optimization and metadata
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    // Optimize the image (reduce size while maintaining quality)
    const optimizedBuffer = await image
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    // Store image securely in database
    const storageId = await SecureImageStorage.storeImage(optimizedBuffer, 'image/jpeg');

    // Save image metadata to database
    const client = await clientPromise;
    const images = client.db().collection<DbStoredImage>('images');

    const imageId = uuidv4();
    const newImage: Omit<DbStoredImage, '_id'> = {
      userId: new ObjectId(session.user.id),
      id: imageId,
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
      storageId: storageId,
      mimeType: 'image/jpeg', // Since we're converting to JPEG
      size: optimizedBuffer.length,
      width: metadata.width,
      height: metadata.height,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await images.insertOne(newImage);

    // Generate data URI for frontend
    const dataUri = SecureImageStorage.bufferToDataUri(optimizedBuffer, 'image/jpeg');

    // Return the image data in the format expected by the frontend
    const responseImage = {
      id: imageId,
      name: newImage.name,
      dataUri: dataUri,
      width: newImage.width,
      height: newImage.height,
      size: newImage.size,
      mimeType: newImage.mimeType,
    };

    return NextResponse.json(responseImage, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
