import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');

    // If user is authenticated and trying to access auth pages, redirect to home
    if (isAuth && isAuthPage) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // If user is not authenticated and trying to access protected pages, redirect to signin
    if (!isAuth && !isAuthPage && !req.nextUrl.pathname.startsWith('/share')) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages and share pages without authentication
        if (req.nextUrl.pathname.startsWith('/auth') || req.nextUrl.pathname.startsWith('/share')) {
          return true;
        }
        // For all other pages, require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
