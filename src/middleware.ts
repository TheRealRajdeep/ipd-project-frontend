import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define which paths are protected (require authentication)
  const isProtectedRoute = path.includes('/dashboard') || 
                           path.includes('/shipments') || 
                           path.includes('/profile');

  // Define which paths are auth routes (login/register)
  const isAuthRoute = path === '/login' || path === '/register';
  
  const token = request.cookies.get('auth_token')?.value;
  
  // If trying to access protected route without being logged in
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If trying to access login/register while logged in
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/dashboard/:path*', '/shipments/:path*', '/profile/:path*', '/login', '/register'],
};
