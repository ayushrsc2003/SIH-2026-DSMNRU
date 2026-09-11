import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';
import { cloudinary, getCloudinaryConfig } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function extractCloudinaryPublicId(url: string | null | undefined): { publicId: string; resourceType: string } | null {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname; // e.g., /<cloud_name>/image/upload/v1234/sih-2026/authorization_letters/xyz.pdf
    const parts = pathname.split('/');
    const uploadIdx = parts.indexOf('upload');
    if (uploadIdx === -1) return null;

    const resourceType = parts[uploadIdx - 1] || 'image'; // image or raw
    const publicPath = parts.slice(uploadIdx + 2).join('/'); // skip version 'v...'
    const publicId = publicPath.replace(/\.[^/.]+$/, ''); // remove extension
    return { publicId, resourceType };
  } catch {
    return null;
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();
    const adminToken = process.env.ADMIN_TOKEN || 'sih2026_admin_secret_token_key';

    const isTokenValid = token === adminToken;
    const isCookieValid = verifyAdminSession();

    if (!isTokenValid && !isCookieValid) {
      return NextResponse.json(
        { error: 'Forbidden: Access restricted to college administrators.' },
        { status: 403 }
      );
    }

    const team = await prisma.team.findFirst({
      where: {
        OR: [{ id: params.id }, { teamId: params.id }],
      },
      include: {
        members: true,
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team submission record not found.' }, { status: 404 });
    }

    // Try deleting Cloudinary assets if configured
    try {
      getCloudinaryConfig();
      if (team.pptUrl) {
        const pptAsset = extractCloudinaryPublicId(team.pptUrl);
        if (pptAsset) {
          await cloudinary.uploader.destroy(pptAsset.publicId, {
            resource_type: pptAsset.resourceType === 'raw' ? 'raw' : 'image',
          }).catch((err) => console.warn('Cloudinary PPT delete skipped:', err));
        }
      }

      if (team.authLetterUrl) {
        const authAsset = extractCloudinaryPublicId(team.authLetterUrl);
        if (authAsset) {
          await cloudinary.uploader.destroy(authAsset.publicId, {
            resource_type: authAsset.resourceType === 'raw' ? 'raw' : 'image',
          }).catch((err) => console.warn('Cloudinary Auth Letter delete skipped:', err));
        }
      }
    } catch (cloudErr) {
      console.warn('Cloudinary cleanup warning:', cloudErr);
    }

    // Delete members first if not cascade
    await prisma.member.deleteMany({
      where: { teamId: team.id },
    });

    // Delete team record
    await prisma.team.delete({
      where: { id: team.id },
    });

    return NextResponse.json({
      success: true,
      message: `Team "${team.teamName}" (${team.teamId}) and its data have been permanently deleted from the database and server.`,
    });
  } catch (error: any) {
    console.error('Delete team error:', error);
    return NextResponse.json(
      { error: 'Failed to delete team registration data.' },
      { status: 500 }
    );
  }
}
