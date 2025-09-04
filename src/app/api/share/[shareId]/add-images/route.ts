import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shareId } = await params;
    const body = await request.json();
    const { imageIds } = body;

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json({ error: 'Image IDs array required' }, { status: 400 });
    }

    // Verify the shared gallery exists and user is the owner
    const existingGallery = await DatabaseService.getSharedGallery(shareId);
    if (!existingGallery) {
      return NextResponse.json({ error: 'Shared gallery not found' }, { status: 404 });
    }

    if (existingGallery.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Only the gallery owner can add images' }, { status: 403 });
    }

    // Get the images to add (ensure they belong to the user)
    const userImages = await DatabaseService.getUserImages(session.user.id);
    const imagesToAdd = userImages.filter(img => imageIds.includes(img.id));

    if (imagesToAdd.length === 0) {
      return NextResponse.json({ error: 'No valid images found to add' }, { status: 400 });
    }

    // Add images to the shared gallery
    const success = await DatabaseService.addImagesToSharedGallery(
      session.user.id, 
      shareId, 
      imagesToAdd
    );

    if (success) {
      return NextResponse.json({ 
        success: true, 
        addedCount: imagesToAdd.length,
        message: `Successfully added ${imagesToAdd.length} image(s) to the shared gallery`
      });
    } else {
      return NextResponse.json({ error: 'Failed to add images to gallery' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error adding images to shared gallery:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
