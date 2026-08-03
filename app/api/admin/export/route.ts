import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function escapeCsvField(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET() {
  try {
    const isAuthenticated = verifyAdminSession();

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
      'Idea Summary',
      'Mentor Name',
      'Mentor Department',
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
          escapeCsvField(team.ideaSummary),
          escapeCsvField(team.mentorName),
          escapeCsvField(team.mentorDept),
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

    const csvContent = rows.join('\n');
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
