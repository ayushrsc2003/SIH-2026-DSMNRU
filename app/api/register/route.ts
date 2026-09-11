import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { generateAuthorizationPdf } from '@/lib/generateAuthorizationPdf';
import sihProblemStatements from '@/data/sihProblemStatements.json';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Participant = { name: string; gender: string; email: string; phone: string; branch: string; year: string };
type RegistrationPayload = { teamName?: string; problemStatementId?: string; problemStatementTitle?: string; acknowledged?: boolean; leader?: Participant; members?: Participant[]; pptUrl?: string; pptFileName?: string };

function generateHumanTeamId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return `SIH26-${Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character] as string));
}

async function forwardToGoogleSheets({
  timestamp,
  teamId,
  teamName,
  psCode,
  psTitle,
  category,
  leader,
  members,
  pptUrl,
  authLetterUrl,
}: {
  timestamp: string;
  teamId: string;
  teamName: string;
  psCode: string;
  psTitle: string;
  category: string;
  leader: Participant;
  members: Participant[];
  pptUrl: string;
  authLetterUrl: string;
}) {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const memberDetailsString = members
      .map((m, idx) => `Member ${idx + 1}: ${m.name} (${m.gender}, ${m.branch}, ${m.year}, ${m.email}, ${m.phone})`)
      .join(' | ');

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp,
        teamId,
        teamName,
        problemStatementCode: psCode,
        problemStatementTitle: psTitle,
        category,
        leaderName: leader.name,
        leaderEmail: leader.email,
        leaderPhone: leader.phone,
        leaderBranch: leader.branch,
        leaderYear: leader.year,
        memberDetails: memberDetailsString,
        pptUrl,
        authLetterUrl,
      }),
    });
  } catch (err) {
    console.error('Failed to forward registration data to Google Sheets webhook:', err);
  }
}

import { sendConfirmationEmail } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    if (new Date() > new Date('2026-09-14T13:00:00+05:30')) return NextResponse.json({ error: 'Registration closed on 14 September 2026 at 1:00 PM.' }, { status: 403 });
    const config = await prisma.systemConfig.findUnique({ where: { id: 'config' } });
    if (!config?.isRegistrationActive) return NextResponse.json({ error: 'Registration is currently closed by college administration.' }, { status: 403 });

    const data = (await req.json()) as RegistrationPayload;
    const teamName = data.teamName?.trim() || '';
    const psCode = data.problemStatementId?.trim() || '';
    const psTitle = data.problemStatementTitle?.trim() || '';
    const leader = data.leader;
    const members = data.members || [];
    const pptUrl = data.pptUrl?.trim() || '';
    const pptFileName = data.pptFileName?.trim() || '';
    const officialProblemStatement = sihProblemStatements.find((statement) => statement.psCode === psCode);

    if (!teamName || !officialProblemStatement || officialProblemStatement.title !== psTitle) return NextResponse.json({ error: 'Please provide a team name and select a valid SIH 2026 problem statement.' }, { status: 400 });
    const academicYears = new Set(['2023-2027', '2024-2028', '2025-2029', '2026-2030']);
    const validBranches = new Set(['CSE', 'CSE AIDS', 'CSE AIFM', 'ECE', 'EE', 'ME', 'CE']);

    if (!data.acknowledged || !leader || !leader.name?.trim() || !leader.gender || !leader.email?.trim() || !leader.phone?.trim() || !validBranches.has(leader.branch) || !academicYears.has(leader.year)) {
      return NextResponse.json({ error: 'Complete team leader details, including valid branch and academic year, and authorization acknowledgement are required.' }, { status: 400 });
    }
    if (members.length !== 5 || members.some((member) => !member.name?.trim() || !member.gender || !member.email?.trim() || !member.phone?.trim() || !validBranches.has(member.branch) || !academicYears.has(member.year))) {
      return NextResponse.json({ error: 'Complete details, including valid branch and academic year, are required for exactly five team members.' }, { status: 400 });
    }
    if (!pptUrl || !pptFileName) return NextResponse.json({ error: 'Upload the presentation to continue.' }, { status: 400 });

    try {
      const uploadedPresentation = new URL(pptUrl);
      if (uploadedPresentation.protocol !== 'https:' || !uploadedPresentation.hostname.includes('cloudinary.com')) throw new Error();
    } catch {
      return NextResponse.json({ error: 'The presentation must be uploaded through the approved Cloudinary service.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const participants = [leader, ...members].map((participant) => ({ ...participant, name: participant.name.trim(), email: participant.email.trim().toLowerCase(), phone: participant.phone.replace(/\D/g, '') }));
    if (participants.some((participant) => !emailRegex.test(participant.email) || !phoneRegex.test(participant.phone))) return NextResponse.json({ error: 'Each participant must have a valid email address and 10-digit mobile number.' }, { status: 400 });
    if (new Set(participants.map((participant) => participant.email)).size !== 6) return NextResponse.json({ error: 'Each team member must use a unique email address.' }, { status: 400 });
    if (!participants.some((participant) => participant.gender.toLowerCase() === 'female' || participant.gender.toLowerCase() === 'f')) return NextResponse.json({ error: 'Every team must include at least one female participant.' }, { status: 400 });

    const existingMembers = await prisma.member.findMany({ where: { email: { in: participants.map((participant) => participant.email) } } });
    if (existingMembers.length) return NextResponse.json({ error: 'One or more participant email addresses are already registered with another team.' }, { status: 409 });

    const authLetterUrl = await generateAuthorizationPdf({
      collegeName: process.env.COLLEGE_NAME || 'Institute of Engineering & Technology (IET), Dr. Shakuntala Misra National Rehabilitation University, Lucknow (UGC AISHE: U-0512)',
      teamName, psCode, psTitle, category: officialProblemStatement.category,
      leaderName: participants[0].name, leaderGender: participants[0].gender, leaderEmail: participants[0].email, leaderPhone: participants[0].phone,
      leaderBranch: participants[0].branch || 'CSE', leaderYear: participants[0].year, deanName: process.env.DEAN_NAME || 'Prof. C.K. Dixit',
      members: participants.slice(1).map((member) => ({ name: member.name, gender: member.gender, email: member.email, phone: member.phone, branch: member.branch || 'CSE', year: member.year })),
    });

    const createdTeam = await prisma.team.create({
      data: {
        teamId: generateHumanTeamId(), teamName, category: officialProblemStatement.category,
        problemStatementId: psCode, problemStatementTitle: psTitle,
        leaderName: participants[0].name, leaderEmail: participants[0].email, leaderPhone: participants[0].phone,
        pptUrl, pptFileName,
        authLetterUrl, authPdfPath: authLetterUrl, authDocxPath: authLetterUrl,
        members: { create: participants.map((participant, index) => ({ name: participant.name, gender: participant.gender, email: participant.email, phone: participant.phone, branch: participant.branch, year: participant.year, isLeader: index === 0 })) },
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sih-2026-dsmnru.onrender.com';
    const letterDirectUrl = `${baseUrl}/api/letters/${createdTeam.teamId}`;
    const effectiveLetterUrl = authLetterUrl.startsWith('http') && !authLetterUrl.startsWith('data:') ? authLetterUrl : letterDirectUrl;

    // Forward to Google Sheets webhook if configured
    forwardToGoogleSheets({
      timestamp: new Date().toISOString(),
      teamId: createdTeam.teamId,
      teamName,
      psCode,
      psTitle,
      category: officialProblemStatement.category,
      leader: participants[0],
      members: participants.slice(1),
      pptUrl,
      authLetterUrl: letterDirectUrl,
    });

    try {
      await sendConfirmationEmail({
        teamId: createdTeam.teamId,
        teamName,
        psCode,
        psTitle,
        category: officialProblemStatement.category,
        leader: participants[0],
      });
    } catch (emailError) {
      console.error('Registration confirmation email failed:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: `Registration submitted successfully for Team "${createdTeam.teamName}".`,
      teamId: createdTeam.teamId,
      authLetterUrl: letterDirectUrl,
    }, { status: 201 });
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json({ error: 'Unable to complete registration. Please try again.' }, { status: 500 });
  }
}
