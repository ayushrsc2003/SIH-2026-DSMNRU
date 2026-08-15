import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') === 'docx' ? 'docx' : 'pdf';
    const tokenParam = searchParams.get('token') || '';

    // Check Token or Cookie Auth
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim() || tokenParam;
    const adminToken = process.env.ADMIN_TOKEN || 'sih2026_admin_secret_token_key';

    const isTokenValid = token === adminToken;
    const isCookieValid = verifyAdminSession();

    if (!isTokenValid && !isCookieValid) {
      return NextResponse.json(
        { error: 'Forbidden: Access to authorization letters is restricted to college administrators.' },
        { status: 403 }
      );
    }

    const team = await prisma.team.findUnique({
      where: { id: params.id },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team submission record not found.' }, { status: 404 });
    }

    const filePath = type === 'docx' ? team.authDocxPath : team.authPdfPath;

    if (!filePath || !fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Requested ${type.toUpperCase()} authorization letter file does not exist on server.` },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    const filename = path.basename(filePath);
    const contentType = type === 'docx'
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/pdf';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Download letter error:', error);
    return NextResponse.json({ error: 'Failed to download authorization letter.' }, { status: 500 });
  }
}
