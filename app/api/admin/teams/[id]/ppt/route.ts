import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const mimeTypes: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim() || searchParams.get('token') || '';
    const expectedToken = process.env.ADMIN_TOKEN || 'sih2026_admin_secret_token_key';

    if (token !== expectedToken && !verifyAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const team = await prisma.team.findUnique({ where: { id: params.id } });
    if (!team?.pptUrl) {
      return NextResponse.json({ error: 'No presentation was uploaded for this team.' }, { status: 404 });
    }

    // Drive links are already hosted externally; send the authenticated admin there.
    if (/^https?:\/\//i.test(team.pptUrl)) {
      return NextResponse.redirect(team.pptUrl);
    }

    if (!team.pptFileName || team.pptFileName === 'Google Drive Link') {
      return NextResponse.json({ error: 'The presentation file reference is incomplete.' }, { status: 404 });
    }

    const uploadsDir = path.join(process.cwd(), 'storage', 'uploads');
    const filePath = path.join(uploadsDir, path.basename(team.pptFileName));
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'The uploaded presentation file is no longer available on the server.' }, { status: 404 });
    }

    const extension = path.extname(filePath).toLowerCase();
    return new NextResponse(fs.readFileSync(filePath), {
      headers: {
        'Content-Type': mimeTypes[extension] || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${path.basename(team.pptFileName)}"`,
      },
    });
  } catch (error) {
    console.error('Download presentation error:', error);
    return NextResponse.json({ error: 'Failed to access the uploaded presentation.' }, { status: 500 });
  }
}
