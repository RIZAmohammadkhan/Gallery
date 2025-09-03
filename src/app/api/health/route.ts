import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    // Check database connection
    const client = await clientPromise;
    await client.db().admin().ping();

    // Check essential environment variables
    const requiredEnvVars = [
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'MONGODB_URI',
      'GEMINI_API_KEY'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        { 
          status: 'unhealthy', 
          message: `Missing environment variables: ${missingEnvVars.join(', ')}` 
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      services: {
        database: 'connected',
        auth: 'configured',
        ai: 'configured'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { status: 'unhealthy', message: 'Internal server error' },
      { status: 503 }
    );
  }
}
