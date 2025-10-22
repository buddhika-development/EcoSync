import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const cookieStore = await cookies();

    // Clear the access_token cookie
    cookieStore.delete('access_token');

    // Get redirect URL from query params or default to /login
    const redirectUrl = req.nextUrl.searchParams.get('redirect') || '/login';

    return NextResponse.redirect(new URL(redirectUrl, req.url));
}
