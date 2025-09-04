import { NextRequest, NextResponse } from 'next/server';
import { getSharedGallery } from '@/lib/sharing';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;
    
    if (!shareId) {
      return NextResponse.json({ error: 'Share ID is required' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const gallery = await getSharedGallery(shareId);
    
    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
    }

    // Add ownership information
    const response = {
      ...gallery,
      isOwner: session?.user?.id === gallery.ownerId
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching shared gallery:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
