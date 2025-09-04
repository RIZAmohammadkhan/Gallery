import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import { User } from '@/lib/models';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('MissingCredentials');
        }

        try {
          const client = await clientPromise;
          // Test connection
          await client.db().admin().ping();
          
          const users = client.db().collection<User>('users');
          
          // Make email case-insensitive by converting to lowercase
          const user = await users.findOne({ 
            email: { $regex: new RegExp(`^${credentials.email}$`, 'i') }
          });
          
          if (!user) {
            throw new Error('UserNotFound');
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValidPassword) {
            throw new Error('InvalidPassword');
          }

          return {
            id: user._id?.toString() || '',
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          if (error instanceof Error && ['MissingCredentials', 'UserNotFound', 'InvalidPassword'].includes(error.message)) {
            throw error;
          }
          console.error('Auth error:', error);
          throw new Error('DatabaseError');
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If user is signing in and no specific URL is provided, redirect to home
      if (url === baseUrl + '/auth/signin' || url === baseUrl + '/auth/signup') {
        return baseUrl;
      }
      // If it's a relative URL, make it absolute
      if (url.startsWith('/')) {
        return baseUrl + url;
      }
      // If it's the same origin, allow it
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Otherwise, redirect to home
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
