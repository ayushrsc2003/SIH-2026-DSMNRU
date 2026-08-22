import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';
import { generateCollegeAuthorizationLetter } from '@/lib/generateAuthLetter';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
      include: { members: { orderBy: { isLeader: 'desc' } } },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team submission record not found.' }, { status: 404 });
    }

    let filePath = type === 'docx' ? team.authDocxPath : team.authPdfPath;

    // Older deployments could save DOCX bytes under a .pdf extension after a
    // PDFKit failure. Regenerate that letter on demand instead of serving a
    // corrupt file to the administrator.
    const isValidPdf = (candidatePath: string | null) => {
      if (!candidatePath || !fs.existsSync(candidatePath)) return false;
      return fs.readFileSync(candidatePath, { encoding: null, flag: 'r' }).subarray(0, 5).toString() === '%PDF-';
    };
    if (type === 'pdf' && !isValidPdf(filePath)) {
      const leader = team.members.find((member) => member.isLeader);
      if (!leader) {
        return NextResponse.json({ error: 'Cannot regenerate this letter because its team leader record is missing.' }, { status: 422 });
      }

      const regenerated = await generateCollegeAuthorizationLetter({
        teamName: team.teamName,
        psId: team.problemStatementId,
        psTitle: team.problemStatementTitle,
        leader: {
          name: leader.name,
          gender: leader.gender,
          email: leader.email,
          phone: leader.phone,
        },
        members: team.members
          .filter((member) => !member.isLeader)
          .map((member) => ({
            name: member.name,
            gender: member.gender,
            email: member.email,
            phone: member.phone,
          })),
      });
      await prisma.team.update({
        where: { id: team.id },
        data: { authDocxPath: regenerated.docxPath, authPdfPath: regenerated.pdfPath },
      });
      filePath = regenerated.pdfPath;
    }

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
