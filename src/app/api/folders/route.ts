import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const folders = await DatabaseService.getUserFolders(session.user.id);
    return NextResponse.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Folder name required' }, { status: 400 });
    }

    const folderData = {
      id: `folder-${uuidv4()}`,
      name: name.trim(),
    };

    const folder = await DatabaseService.createFolder(session.user.id, folderData);
    
    if (folder) {
      return NextResponse.json(folder, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');

    if (!folderId) {
      return NextResponse.json({ error: 'Folder ID required' }, { status: 400 });
    }

    const success = await DatabaseService.deleteFolder(session.user.id, folderId);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Folder not found or deletion failed' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
