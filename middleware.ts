import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { guestRegex, isDevelopmentEnvironment } from './lib/constants';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // simple health-check
  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 });
  }

  // never run on Next internals or API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // pages that should be reachable without a token
  const publicPaths = [
    '/login',
    '/register',
    '/favicon.ico',
    '/opengraph-image',
    '/twitter-image',
    '/api/auth/guest', // allow the guest handler itself
  ];
  const isPublic =
    publicPaths.some((p) => pathname.startsWith(p)) ||
    /\.[a-zA-Z0-9]+$/.test(pathname); // any static asset

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  // If no token and the path is protected, send user to guest (or /login if you prefer)
  if (!token && !isPublic) {
    const redirectUrl = encodeURIComponent(request.url);
    return NextResponse.redirect(
      new URL(`/api/auth/guest?redirectUrl=${redirectUrl}`, request.url),
    );
  }

  // If logged-in (non-guest) user hits login/register, push them home
  const isGuest = guestRegex.test(token?.email ?? '');
  if (
    token &&
    !isGuest &&
    (pathname === '/login' || pathname === '/register')
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // run on all pages except API, Next internals, and static files
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
