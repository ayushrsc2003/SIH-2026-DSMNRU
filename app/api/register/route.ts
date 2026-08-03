import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RegistrationPayload, MemberInput } from '@/lib/types';
import { Prisma } from '@prisma/client';

function generateHumanTeamId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random = '';
  for (let i = 0; i < 5; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SIH26-${random}`;
}

export async function POST(req: Request) {
  try {
    const body: RegistrationPayload = await req.json();
    const { teamName, domain, ideaSummary, mentorName, mentorDept, members } = body;

    // 1. Basic validation
    if (!teamName || !domain || !ideaSummary || !mentorName || !mentorDept) {
      return NextResponse.json(
        { error: 'All team and mentor details are required.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(members) || members.length !== 6) {
      return NextResponse.json(
        { error: 'Every team must have exactly 6 members.' },
        { status: 400 }
      );
    }

    // 2. Member level validation
    const emailsInPayload = new Set<string>();
    let femaleCount = 0;

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name || !m.branch || !m.year || !m.universityId || !m.gender || !m.email || !m.phone) {
        return NextResponse.json(
          { error: `Member ${i + 1} (${m.name || 'Unnamed'}) has incomplete fields.` },
          { status: 400 }
        );
      }

      const emailLower = m.email.toLowerCase().trim();
      
      // Email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailLower)) {
        return NextResponse.json(
          { error: `Invalid email format for Member ${i + 1}: ${m.email}` },
          { status: 400 }
        );
      }

      // Check intra-team duplicate email
      if (emailsInPayload.has(emailLower)) {
        return NextResponse.json(
          { error: `Duplicate email "${m.email}" found inside your team submission.` },
          { status: 400 }
        );
      }
      emailsInPayload.add(emailLower);

      if (m.gender.toLowerCase() === 'female') {
        femaleCount++;
      }
    }

    // 3. Gender rule validation
    if (femaleCount < 1) {
      return NextResponse.json(
        { error: 'Team composition requirement failed: Every team must include at least 1 female member.' },
        { status: 400 }
      );
    }

    const emailList = Array.from(emailsInPayload);

    // 4. Pre-check existing registered emails across ALL teams in DB
    const existingMembers = await prisma.member.findMany({
      where: {
        email: {
          in: emailList,
        },
      },
      include: {
        team: {
          select: {
            teamId: true,
            teamName: true,
          },
        },
      },
    });

    if (existingMembers.length > 0) {
      const conflictingDetails = existingMembers.map((m) => ({
        email: m.email,
        name: m.name,
        registeredTeam: m.team.teamName,
        teamId: m.team.teamId,
      }));

      const conflictEmails = conflictingDetails.map((c) => c.email).join(', ');

      return NextResponse.json(
        {
          error: `Registration failed! The following email(s) are already registered: ${conflictEmails}. A student can belong to AT MOST ONE team.`,
          conflictDetails: conflictingDetails,
        },
        { status: 409 }
      );
    }

    // 5. Database transaction for atomic Team + Members creation with human-readable teamId
    let attempts = 0;
    let teamId = generateHumanTeamId();
    let createdTeam;

    while (attempts < 5) {
      try {
        createdTeam = await prisma.$transaction(async (tx) => {
          const team = await tx.team.create({
            data: {
              teamId,
              teamName: teamName.trim(),
              domain: domain.trim(),
              ideaSummary: ideaSummary.trim(),
              mentorName: mentorName.trim(),
              mentorDept: mentorDept.trim(),
              members: {
                create: members.map((m, index) => ({
                  name: m.name.trim(),
                  branch: m.branch.trim(),
                  year: m.year.trim(),
                  universityId: m.universityId.trim(),
                  gender: m.gender.trim(),
                  email: m.email.toLowerCase().trim(),
                  phone: m.phone.trim(),
                  isLeader: index === 0 || !!m.isLeader,
                })),
              },
            },
            include: {
              members: true,
            },
          });
          return team;
        });

        break; // Success! Break out of retry loop
      } catch (err: any) {
        // Unique constraint violation (e.g. race condition on email or teamId)
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          const target = (err.meta?.target as string[]) || [];
          if (target.includes('email')) {
            return NextResponse.json(
              {
                error: 'Registration conflict! One of the member emails was just registered by another team in a concurrent request.',
              },
              { status: 409 }
            );
          }
          // If teamId collided, retry with new teamId
          teamId = generateHumanTeamId();
          attempts++;
        } else {
          throw err;
        }
      }
    }

    if (!createdTeam) {
      return NextResponse.json(
        { error: 'Failed to generate unique team ID after multiple retries. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Team successfully registered!',
        teamId: createdTeam.teamId,
        teamName: createdTeam.teamName,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error occurred during registration.' },
      { status: 500 }
    );
  }
}
