import { NextResponse } from 'next/server';
import { createAdminSessionToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const token = createAdminSessionToken(password);

    if (!token) {
      return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, message: 'Authenticated successfully' });
    
    // Set HTTP-only session cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
