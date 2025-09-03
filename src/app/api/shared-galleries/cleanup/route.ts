import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { cleanupExpiredGalleries } from '@/lib/sharing';

// POST - Cleanup expired galleries
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cleanedCount = await cleanupExpiredGalleries();
    return NextResponse.json({ cleanedCount });
  } catch (error) {
    console.error('Error cleaning up expired galleries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
