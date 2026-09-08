import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { generateAuthorizationLetter } from '@/lib/generateAuthorizationLetter';
import sihProblemStatements from '@/data/sihProblemStatements.json';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Participant = { name: string; gender: string; email: string; phone: string; year: string };
type RegistrationPayload = { teamName?: string; problemStatementId?: string; problemStatementTitle?: string; acknowledged?: boolean; leader?: Participant; members?: Participant[]; pptUrl?: string; pptFileName?: string };

function generateHumanTeamId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return `SIH26-${Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character] as string));
}

async function sendConfirmationEmail({ teamId, teamName, psCode, psTitle, category, leader, authLetterUrl }: { teamId: string; teamName: string; psCode: string; psTitle: string; category: string; leader: Participant; authLetterUrl: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    console.warn('Registration confirmation email skipped: Resend is not configured.');
    return;
  }
  const values = [['Team ID', teamId], ['Team Name', teamName], ['Problem Statement', `${psCode} - ${psTitle}`], ['Category', category], ['Team Leader', leader.name], ['Leader Email', leader.email], ['Leader Phone', leader.phone]];
  const rows = values.map(([label, value]) => `<tr><td style="padding:8px;border:1px solid #d1d5db;font-weight:600">${escapeHtml(label)}</td><td style="padding:8px;border:1px solid #d1d5db">${escapeHtml(value)}</td></tr>`).join('');
  await new Resend(apiKey).emails.send({
    from,
    to: leader.email,
    replyTo: 'achaurasiya_csebtech23_041@dsmnru.ac.in',
    subject: `SIH 2026 Registration Confirmed - ${teamId}`,
    html: `<main style="font-family:Arial,sans-serif;color:#111827;max-width:640px;margin:0 auto"><h1>SIH 2026 Internal Hackathon Registration Confirmed</h1><p>Hello ${escapeHtml(leader.name)},</p><p>Your team registration has been received successfully. Keep your Team ID for future reference.</p><table style="border-collapse:collapse;width:100%"><tbody>${rows}</tbody></table><p style="margin:28px 0"><a href="${authLetterUrl}" style="background:#ea580c;color:#ffffff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:700">Download Authorization Letter</a></p><p><strong>Next step:</strong> Print the authorization letter, obtain the HOD/Dean's physical signature and official stamp, and bring it to the internal evaluation round.</p><p>Regards,<br>SIH 2026 Internal Hackathon Team<br>IET DSMNRU<br>Student Coordinator Contact: achaurasiya_csebtech23_041@dsmnru.ac.in</p></main>`,
  });
}

export async function POST(req: Request) {
  try {
    if (new Date() > new Date('2026-09-12T23:59:59+05:30')) return NextResponse.json({ error: 'Registration closed on 12 September 2026.' }, { status: 403 });
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
    if (!data.acknowledged || !leader || !leader.name?.trim() || !leader.gender || !leader.email?.trim() || !leader.phone?.trim() || !academicYears.has(leader.year)) return NextResponse.json({ error: 'Complete team leader details, including academic year, and authorization acknowledgement are required.' }, { status: 400 });
    if (members.length !== 5 || members.some((member) => !member.name?.trim() || !member.gender || !member.email?.trim() || !member.phone?.trim() || !academicYears.has(member.year))) return NextResponse.json({ error: 'Complete details, including academic year, are required for exactly five team members.' }, { status: 400 });
    if (!pptUrl || !pptFileName) return NextResponse.json({ error: 'Upload the presentation to continue.' }, { status: 400 });

    try {
      const uploadedPresentation = new URL(pptUrl);
      if (uploadedPresentation.protocol !== 'https:' || !uploadedPresentation.hostname.endsWith('res.cloudinary.com')) throw new Error();
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

    const authLetterUrl = await generateAuthorizationLetter({
      collegeName: process.env.COLLEGE_NAME || 'Institute of Engineering & Technology (IET), Dr. Shakuntala Misra National Rehabilitation University, Lucknow',
      teamName, psCode, psTitle, category: officialProblemStatement.category,
      leaderName: participants[0].name, leaderGender: participants[0].gender, leaderEmail: participants[0].email, leaderPhone: participants[0].phone,
      leaderBranch: 'B.Tech CSE', leaderYear: participants[0].year, deanName: process.env.DEAN_NAME || 'Principal / Dean',
      members: participants.slice(1).map((member) => ({ name: member.name, gender: member.gender, email: member.email, phone: member.phone, branch: 'B.Tech CSE', year: member.year })),
    });

    const createdTeam = await prisma.team.create({
      data: {
        teamId: generateHumanTeamId(), teamName, category: officialProblemStatement.category,
        problemStatementId: psCode, problemStatementTitle: psTitle,
        leaderName: participants[0].name, leaderEmail: participants[0].email, leaderPhone: participants[0].phone,
        pptUrl, pptFileName,
        authLetterUrl, authDocxPath: authLetterUrl,
        members: { create: participants.map((participant, index) => ({ name: participant.name, gender: participant.gender, email: participant.email, phone: participant.phone, year: participant.year, isLeader: index === 0 })) },
      },
    });

    try {
      await sendConfirmationEmail({ teamId: createdTeam.teamId, teamName, psCode, psTitle, category: officialProblemStatement.category, leader: participants[0], authLetterUrl });
    } catch (emailError) {
      console.error('Registration confirmation email failed:', emailError);
    }

    return NextResponse.json({ success: true, message: `Registration submitted successfully for Team "${createdTeam.teamName}".`, teamId: createdTeam.teamId }, { status: 201 });
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json({ error: 'Unable to complete registration. Please try again.' }, { status: 500 });
  }
}
