import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function escapeCsvField(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get('authorization') || '';
    const suppliedToken = authHeader.replace(/^Bearer\s+/i, '').trim() || searchParams.get('token') || '';
    const expectedToken = process.env.ADMIN_TOKEN || 'sih2026_admin_secret_token_key';
    const isAuthenticated = suppliedToken === expectedToken || verifyAdminSession();

    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const teams = await prisma.team.findMany({
      include: {
        members: {
          orderBy: {
            isLeader: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const headers = [
      'Team ID',
      'Team Name',
      'Domain',
      'Problem Statement ID',
      'Problem Statement Title',
      'Idea Summary',
      'Mentor Name',
      'Mentor Department',
      'PPT File Link',
      'Registration Date',
      'Member Role',
      'Member Name',
      'Branch',
      'Year',
      'University ID',
      'Gender',
      'Email',
      'Phone',
    ];

    const rows: string[] = [headers.join(',')];

    teams.forEach((team) => {
      team.members.forEach((member) => {
        const row = [
          escapeCsvField(team.teamId),
          escapeCsvField(team.teamName),
          escapeCsvField(team.domain),
          escapeCsvField(team.problemStatementId),
          escapeCsvField(team.problemStatementTitle),
          escapeCsvField(team.ideaSummary),
          escapeCsvField(team.mentorName),
          escapeCsvField(team.mentorDept),
          escapeCsvField(team.pptUrl || 'Not Uploaded'),
          escapeCsvField(new Date(team.createdAt).toISOString()),
          escapeCsvField(member.isLeader ? 'Leader' : 'Member'),
          escapeCsvField(member.name),
          escapeCsvField(member.branch),
          escapeCsvField(member.year),
          escapeCsvField(member.universityId),
          escapeCsvField(member.gender),
          escapeCsvField(member.email),
          escapeCsvField(member.phone),
        ];
        rows.push(row.join(','));
      });
    });

    // UTF-8 BOM lets Excel display Indian names and other Unicode text correctly.
    const csvContent = `\uFEFF${rows.join('\n')}`;
    const filename = `SIH2026_DSMNRU_Teams_${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Export CSV error:', error);
    return NextResponse.json({ error: 'Failed to generate CSV export' }, { status: 500 });
  }
}
