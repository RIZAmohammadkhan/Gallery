import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { DbStoredImage } from '@/lib/models';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { ObjectId } from 'mongodb';

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

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

    await ensureUploadDir();

    // Generate unique filename
    const fileId = uuidv4();
    const fileExtension = path.extname(file.name);
    const filename = `${fileId}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process image with Sharp for optimization and metadata
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    // Optimize and save the image
    await image
      .jpeg({ quality: 85, progressive: true })
      .toFile(filePath);

    // Save to database
    const client = await clientPromise;
    const images = client.db().collection<DbStoredImage>('images');

    const newImage: Omit<DbStoredImage, '_id'> = {
      userId: new ObjectId(session.user.id),
      id: fileId,
      name: file.name.replace(fileExtension, ''),
      filename,
      fileUrl: `/api/uploads/${filename}`,
      mimeType: file.type,
      size: file.size,
      width: metadata.width,
      height: metadata.height,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await images.insertOne(newImage);

    // Return the image data in the format expected by the frontend
    const responseImage = {
      id: fileId,
      name: newImage.name,
      dataUri: newImage.fileUrl,
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
