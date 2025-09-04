import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function DELETE(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;

    // Connect to the database
    const client = await clientPromise;
    const db = client.db('gallery');

    // Start a transaction to ensure all deletions happen atomically
    const session_db = client.startSession();
    
    try {
      await session_db.withTransaction(async () => {
        // Delete all user's images
        await db.collection('images').deleteMany({ userEmail });
        
        // Delete all user's folders
        await db.collection('folders').deleteMany({ userEmail });
        
        // Delete all user's shared galleries
        await db.collection('sharedGalleries').deleteMany({ userEmail });
        
        // Delete all user's settings
        await db.collection('settings').deleteMany({ userEmail });
        
        // Delete the user account itself (if you have a users collection)
        // Note: NextAuth might handle user data differently
        await db.collection('users').deleteOne({ email: userEmail });
      });
    } finally {
      await session_db.endSession();
    }

    return NextResponse.json(
      { message: 'Account and all associated data have been permanently deleted' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
