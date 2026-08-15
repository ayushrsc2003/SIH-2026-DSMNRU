import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CheckStatusResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { registered: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const emailClean = email.toLowerCase().trim();

    const member = await prisma.member.findUnique({
      where: {
        email: emailClean,
      },
      include: {
        team: {
          select: {
            teamId: true,
            teamName: true,
            domain: true,
            problemStatementId: true,
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json<CheckStatusResponse>(
        {
          registered: false,
          message: 'No team registration found for this email address.',
        },
        { status: 200 }
      );
    }

    return NextResponse.json<CheckStatusResponse>(
      {
        registered: true,
        teamName: member.team.teamName,
        teamId: member.team.teamId,
        domain: member.team.domain,
        problemStatementId: member.team.problemStatementId,
        message: `Registered under Team ${member.team.teamName} (${member.team.teamId}) - PS: ${member.team.problemStatementId}`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Check status error:', error);
    return NextResponse.json(
      { registered: false, message: 'Server error checking registration status.' },
      { status: 500 }
    );
  }
}
