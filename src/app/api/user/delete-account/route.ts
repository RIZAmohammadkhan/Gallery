import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to delete your account' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Validate that userId is a valid ObjectId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Connect to the database
    const client = await clientPromise;
    const db = client.db();

    // Test database connection
    await client.db().admin().ping();

    // Start a transaction to ensure all deletions happen atomically
    const session_db = client.startSession();
    
    let deletionResults = {
      images: 0,
      imageStorage: 0,
      folders: 0,
      sharedGalleries: 0,
      userSettings: 0,
      userAccount: 0
    };
    
    try {
      await session_db.withTransaction(async () => {
        // Delete all user's images (using userId as ObjectId)
        const imagesResult = await db.collection('images').deleteMany({ userId: new ObjectId(userId) });
        deletionResults.images = imagesResult.deletedCount;
        
        // Delete all image storage data for this user
        const storageResult = await db.collection('image_storage').deleteMany({ userId: new ObjectId(userId) });
        deletionResults.imageStorage = storageResult.deletedCount;
        
        // Delete all user's folders (using userId as ObjectId)
        const foldersResult = await db.collection('folders').deleteMany({ userId: new ObjectId(userId) });
        deletionResults.folders = foldersResult.deletedCount;
        
        // Delete all user's shared galleries (using userId as ObjectId)
        const galleriesResult = await db.collection('shared_galleries').deleteMany({ userId: new ObjectId(userId) });
        deletionResults.sharedGalleries = galleriesResult.deletedCount;
        
        // Delete all user's settings (using userId as ObjectId)
        const settingsResult = await db.collection('user_settings').deleteMany({ userId: new ObjectId(userId) });
        deletionResults.userSettings = settingsResult.deletedCount;
        
        // Delete the user account itself (using email for user lookup)
        const userResult = await db.collection('users').deleteOne({ email: userEmail });
        deletionResults.userAccount = userResult.deletedCount;
        
        // Verify that the user account was actually deleted
        if (userResult.deletedCount === 0) {
          throw new Error('User account not found or could not be deleted');
        }
      });
    } finally {
      await session_db.endSession();
    }

    console.log(`Account deletion completed for user ${userEmail}:`, deletionResults);

    return NextResponse.json(
      { 
        message: 'Account and all associated data have been permanently deleted',
        deletedData: {
          images: deletionResults.images,
          folders: deletionResults.folders,
          sharedGalleries: deletionResults.sharedGalleries,
          settings: deletionResults.userSettings > 0
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting account:', error);
    
    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('User account not found')) {
        return NextResponse.json(
          { error: 'User account not found or already deleted' },
          { status: 404 }
        );
      }
      
      if (error.message.includes('connection') || error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Database connection error. Please try again later.' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to delete account due to an internal server error' },
      { status: 500 }
    );
  }
}
