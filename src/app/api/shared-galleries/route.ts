import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createSharedGallery, listSharedGalleries, deleteSharedGallery } from '@/lib/sharing';

// GET - List user's shared galleries
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const galleries = await listSharedGalleries(session.user.id);
    return NextResponse.json(galleries);
  } catch (error) {
    console.error('Error fetching shared galleries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new shared gallery
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, images, expirationDays } = body;

    if (!title || !images || !Array.isArray(images)) {
      return NextResponse.json({ error: 'Title and images are required' }, { status: 400 });
    }

    const shareId = await createSharedGallery(session.user.id, title, images, expirationDays);
    
    if (shareId) {
      return NextResponse.json({ shareId });
    } else {
      return NextResponse.json({ error: 'Failed to create shared gallery' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating shared gallery:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a shared gallery
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json({ error: 'Share ID is required' }, { status: 400 });
    }

    const success = await deleteSharedGallery(session.user.id, shareId);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Gallery not found or delete failed' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting shared gallery:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
