import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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

    const totalTeams = teams.length;
    const totalStudents = teams.reduce((acc, t) => acc + t.members.length, 0);
    
    // Domain stats breakdown
    const domainCounts: Record<string, number> = {};
    let teamsPassingGenderCheck = 0;

    teams.forEach((t) => {
      domainCounts[t.domain] = (domainCounts[t.domain] || 0) + 1;
      const hasFemale = t.members.some((m) => m.gender.toLowerCase() === 'female');
      if (hasFemale && t.members.length === 6) {
        teamsPassingGenderCheck++;
      }
    });

    return NextResponse.json({
      teams,
      stats: {
        totalTeams,
        totalStudents,
        teamsPassingGenderCheck,
        genderCheckPassRate: totalTeams ? Math.round((teamsPassingGenderCheck / totalTeams) * 100) : 100,
        domainCounts,
      },
    });
  } catch (error: any) {
    console.error('Admin teams fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}
