import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Verify token or cookie session
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();
    const adminToken = process.env.ADMIN_TOKEN || 'sih2026_admin_secret_token_key';

    const isTokenValid = token === adminToken;
    const isCookieValid = verifyAdminSession();

    if (!isTokenValid && !isCookieValid) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication token or session required.' }, { status: 401 });
    }

    const teams = await prisma.team.findMany({
      include: {
        members: {
          orderBy: { isLeader: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const submissions = teams.map((team) => {
      const leader = team.members.find((m) => m.isLeader) || team.members[0];
      return {
        id: team.id,
        teamId: team.teamId,
        teamName: team.teamName,
        problemStatementId: team.problemStatementId,
        problemStatementTitle: team.problemStatementTitle,
        leaderName: leader?.name || 'N/A',
        leaderEmail: leader?.email || 'N/A',
        leaderMobile: leader?.phone || 'N/A',
        memberCount: team.members.length,
        hasPresentation: !!team.pptUrl,
        hasAuthDocx: !!team.authDocxPath,
        hasAuthPdf: !!team.authPdfPath,
        createdAt: team.createdAt,
      };
    });

    return NextResponse.json({ submissions });
  } catch (error: any) {
    console.error('Admin letters error:', error);
    return NextResponse.json({ error: 'Failed to fetch letter records.' }, { status: 500 });
  }
}
