import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { imageIds } = body;

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json({ error: 'Image IDs array required' }, { status: 400 });
    }

    // Delete images one by one to ensure proper authorization and cleanup
    const results = await Promise.allSettled(
      imageIds.map(imageId => DatabaseService.deleteImage(session.user.id, imageId))
    );

    // Count successful deletions
    const successCount = results.filter(result => 
      result.status === 'fulfilled' && result.value === true
    ).length;

    const failedCount = imageIds.length - successCount;

    if (successCount === 0) {
      return NextResponse.json({ 
        error: 'No images could be deleted', 
        successCount: 0, 
        failedCount 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      successCount, 
      failedCount,
      message: failedCount > 0 
        ? `${successCount} images deleted successfully, ${failedCount} failed`
        : `${successCount} images deleted successfully`
    });

  } catch (error) {
    console.error('Error in bulk delete:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
