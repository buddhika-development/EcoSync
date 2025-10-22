// client/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const hasCookie = Boolean(req.cookies.get('access_token'));

    // Root should never be visible
    if (path === '/') {
        return NextResponse.redirect(new URL(hasCookie ? '/app/home' : '/login', req.url));
    }

    // Only gate protected namespaces for cookie presence
    // Server layouts will handle actual validation and role-based redirects
    const isProtected = path.startsWith('/admin') || path.startsWith('/collector') || path.startsWith('/app');
    if (isProtected && !hasCookie) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/login', '/admin/:path*', '/collector/:path*', '/app/:path*'],
};
