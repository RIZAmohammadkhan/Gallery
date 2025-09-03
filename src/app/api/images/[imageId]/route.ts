import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SecureImageStorage } from '@/lib/storage';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageId } = await params;
    
    // Security: verify user owns this image
    const client = await clientPromise;
    const images = client.db().collection('images');
    const imageRecord = await images.findOne({ 
      id: imageId, 
      userId: new ObjectId(session.user.id) 
    });

    if (!imageRecord) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Get image data from secure storage
    const imageStorage = await SecureImageStorage.getImage(imageRecord.storageId);
    
    if (!imageStorage) {
      return NextResponse.json({ error: 'Image data not found' }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(imageStorage.data), {
      headers: {
        'Content-Type': imageStorage.mimeType,
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour but keep private
        'Content-Length': imageStorage.size.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
