import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAuthorizationPdfBytes } from '@/lib/generateAuthorizationPdf';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Team identifier is required.' }, { status: 400 });
    }

    const team = await prisma.team.findFirst({
      where: {
        OR: [{ id: id }, { teamId: id }],
      },
      include: {
        members: {
          orderBy: { isLeader: 'desc' },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    const leader = team.members.find((m) => m.isLeader) || team.members[0];
    const members = team.members.filter((m) => m.id !== leader?.id);

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
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('Error serving authorization letter PDF:', error);
    return NextResponse.json({ error: 'Failed to generate authorization letter PDF.' }, { status: 500 });
  }
}
