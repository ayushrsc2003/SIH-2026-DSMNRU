import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { id: 'config' },
    });

    return NextResponse.json({
      isRegistrationActive: config ? config.isRegistrationActive : false,
    });
  } catch (error: any) {
    console.error('Error checking registration config:', error);
    return NextResponse.json({ isRegistrationActive: false });
  }
}

export async function POST(req: Request) {
  try {
    const adminHeaderToken = req.headers.get('x-admin-token') || req.headers.get('authorization')?.replace('Bearer ', '').trim();
    const expectedToken = process.env.ADMIN_TOKEN || 'sih2026_admin_secret_token_key';
    const isCookieValid = verifyAdminSession();

    if (adminHeaderToken !== expectedToken && !isCookieValid) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid x-admin-token or admin session required.' },
        { status: 401 }
      );
    }

    const { isRegistrationActive } = await req.json();

    if (typeof isRegistrationActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Field isRegistrationActive must be a boolean.' },
        { status: 400 }
      );
    }

    const updatedConfig = await prisma.systemConfig.upsert({
      where: { id: 'config' },
      update: { isRegistrationActive },
      create: { id: 'config', isRegistrationActive },
    });

    return NextResponse.json({
      success: true,
      isRegistrationActive: updatedConfig.isRegistrationActive,
      message: `Registration status updated to ${updatedConfig.isRegistrationActive ? 'ACTIVE (ON)' : 'CLOSED (OFF)'}`,
    });
  } catch (error: any) {
    console.error('Error toggling registration config:', error);
    return NextResponse.json({ error: 'Failed to update system registration status.' }, { status: 500 });
  }
}
