import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import PocketBase from 'pocketbase';

// Define protected routes that require authentication
const protectedRoutes = ['/profile', '/watchlists'];

// Define public routes that should redirect to home if already authenticated
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if the route is an auth route (login/signup)
  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Get the auth cookie and validate it properly
  const authCookie = request.cookies.get('pb_auth');
  let isAuthenticated = false;

  if (authCookie?.value) {
    try {
      // Create a PocketBase instance and load the auth cookie
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
      pb.authStore.loadFromCookie(`pb_auth=${authCookie.value}`);
      isAuthenticated = pb.authStore.isValid;
    } catch (error) {
      // If cookie is invalid, treat as not authenticated
      console.error('Error validating auth cookie:', error);
      isAuthenticated = false;
    }
  }

  // If trying to access a protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    // Store the original URL to redirect back after login
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access login/signup while already authenticated
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
