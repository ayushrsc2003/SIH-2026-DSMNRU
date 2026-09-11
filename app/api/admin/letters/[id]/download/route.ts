import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';
import { generateAuthorizationPdfBytes } from '@/lib/generateAuthorizationPdf';
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

    const team = await prisma.team.findFirst({
      where: {
        OR: [{ id: params.id }, { teamId: params.id }],
      },
      include: { members: { orderBy: { isLeader: 'desc' } } },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team submission record not found.' }, { status: 404 });
    }

    if (type === 'pdf') {
      const leader = team.members.find((member) => member.isLeader) || team.members[0];
      const members = team.members.filter((member) => member.id !== leader?.id);

      const pdfBytes = await generateAuthorizationPdfBytes({
        teamName: team.teamName,
        psCode: team.problemStatementId,
        psTitle: team.problemStatementTitle,
        category: team.category,
        leaderName: leader?.name || team.leaderName || 'Team Leader',
        leaderGender: leader?.gender || 'M',
        leaderEmail: leader?.email || team.leaderEmail || '',
        leaderPhone: leader?.phone || team.leaderPhone || '',
        leaderBranch: leader?.branch || 'CSE',
        leaderYear: leader?.year || '3rd Year',
        members: members.map((m) => ({
          name: m.name,
          gender: m.gender,
          email: m.email,
          phone: m.phone,
          branch: m.branch,
          year: m.year,
        })),
      });

      const safeTeamName = team.teamName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40) || 'Team';
      const filename = `SIH2026_Authorization_${safeTeamName}.pdf`;

      return new NextResponse(Buffer.from(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    if (team.authLetterUrl) {
      return NextResponse.redirect(team.authLetterUrl);
    }

    return NextResponse.json({ error: 'Authorization letter not found.' }, { status: 404 });
  } catch (error: any) {
    console.error('Download letter error:', error);
    return NextResponse.json({ error: 'Failed to download authorization letter.' }, { status: 500 });
  }
}
