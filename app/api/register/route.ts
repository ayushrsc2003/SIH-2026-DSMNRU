import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateCollegeAuthorizationLetter } from '@/lib/generateAuthLetter';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

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
    const formData = await req.formData();

    const teamName = (formData.get('teamName') as string || '').trim();
    const problemStatementId = (formData.get('problemStatementId') as string || '').trim();
    const problemStatementTitle = (formData.get('problemStatementTitle') as string || '').trim();
    const acknowledged = formData.get('acknowledged') === 'true' || formData.get('acknowledged') === 'on';

    // Parse Leader details
    const leaderName = (formData.get('leaderName') as string || '').trim();
    const leaderGender = (formData.get('leaderGender') as string || '').trim();
    const leaderEmail = (formData.get('leaderEmail') as string || '').toLowerCase().trim();
    const leaderMobile = (formData.get('leaderMobile') as string || '').trim();

    // Parse 5 Members
    const membersRaw = formData.get('members') as string;
    let members: Array<{ name: string; gender: string; email: string; phone: string }> = [];

    if (membersRaw) {
      try {
        members = JSON.parse(membersRaw);
      } catch (e) {
        // Fallback parsing individual form keys
      }
    }

    if (members.length === 0) {
      for (let i = 1; i <= 5; i++) {
        members.push({
          name: (formData.get(`member_${i}_name`) as string || '').trim(),
          gender: (formData.get(`member_${i}_gender`) as string || '').trim(),
          email: (formData.get(`member_${i}_email`) as string || '').toLowerCase().trim(),
          phone: (formData.get(`member_${i}_mobile`) as string || '').trim(),
        });
      }
    }

    // 1. Mandatory Field Validation
    if (!teamName || !problemStatementId || !problemStatementTitle) {
      return NextResponse.json(
        { error: 'Team Name, Problem Statement ID, and Problem Statement Title are required.' },
        { status: 400 }
      );
    }

    if (!leaderName || !leaderGender || !leaderEmail || !leaderMobile) {
      return NextResponse.json(
        { error: 'Complete details are required for the Team Leader.' },
        { status: 400 }
      );
    }

    if (!acknowledged) {
      return NextResponse.json(
        { error: 'You must acknowledge the official SIH 2026 College Authorization Letter format requirement.' },
        { status: 400 }
      );
    }

    // 2. Member Count & Fields Validation (Leader + 5 Members = 6 Total)
    if (members.length !== 5) {
      return NextResponse.json(
        { error: 'You must provide details for exactly 5 team members in addition to the team leader.' },
        { status: 400 }
      );
    }

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name || !m.gender || !m.email || !m.phone) {
        return NextResponse.json(
          { error: `Complete details are required for Member #${i + 1} (${m.name || 'Unnamed'}).` },
          { status: 400 }
        );
      }
    }

    // 3. Email & Phone Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!emailRegex.test(leaderEmail)) {
      return NextResponse.json({ error: `Invalid email format for Team Leader: ${leaderEmail}` }, { status: 400 });
    }
    if (!phoneRegex.test(leaderMobile.replace(/\D/g, ''))) {
      return NextResponse.json({ error: `Team Leader mobile number must be a valid 10-digit number.` }, { status: 400 });
    }

    const allEmails = [leaderEmail, ...members.map((m) => m.email)];
    const uniqueEmails = new Set(allEmails);

    if (uniqueEmails.size !== 6) {
      return NextResponse.json(
        { error: 'Duplicate email addresses detected within your team submission.' },
        { status: 400 }
      );
    }

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!emailRegex.test(m.email)) {
        return NextResponse.json({ error: `Invalid email format for Member #${i + 1}: ${m.email}` }, { status: 400 });
      }
      if (!phoneRegex.test(m.phone.replace(/\D/g, ''))) {
        return NextResponse.json({ error: `Member #${i + 1} mobile number must be a valid 10-digit number.` }, { status: 400 });
      }
    }

    // 4. Gender Diversity Check (Min. 1 Female across Leader + 5 Members)
    const allGenders = [leaderGender, ...members.map((m) => m.gender)];
    const femaleCount = allGenders.filter((g) => g.toLowerCase() === 'female' || g.toLowerCase() === 'f').length;

    if (femaleCount < 1) {
      return NextResponse.json(
        { error: 'SIH Rule Violation: Every team must include at least 1 female participant across leader and members.' },
        { status: 400 }
      );
    }

    // 5. File Upload Handling (.pdf, .ppt, .pptx only, Max 5MB)
    const pptFile = formData.get('pptFile') as File | null;
    let pptUrl = '';
    let pptFileName = '';

    if (!pptFile || typeof pptFile.name !== 'string' || pptFile.size === 0) {
      return NextResponse.json(
        { error: 'Idea PPT/PDF file upload is required.' },
        { status: 400 }
      );
    }

    // Check File Size (Max 5MB = 5 * 1024 * 1024 bytes)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (pptFile.size > maxSizeBytes) {
      return NextResponse.json(
        { error: `File size exceeds maximum limit of 5 MB. Current file size: ${(pptFile.size / (1024 * 1024)).toFixed(2)} MB` },
        { status: 400 }
      );
    }

    // Check File Extension
    const fileExt = path.extname(pptFile.name).toLowerCase();
    if (!['.pdf', '.ppt', '.pptx'].includes(fileExt)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only .pdf, .ppt, and .pptx files are allowed.' },
        { status: 400 }
      );
    }

    // Save File to Storage
    const uploadsDir = path.join(process.cwd(), 'storage', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const sanitizedTeam = teamName.replace(/[^a-zA-Z0-9_-]/g, '_');
    pptFileName = `SIH2026_Idea_${sanitizedTeam}_${timestamp}${fileExt}`;
    const pptFilePath = path.join(uploadsDir, pptFileName);

    const arrayBuffer = await pptFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(pptFilePath, buffer);
    pptUrl = `/storage/uploads/${pptFileName}`;

    // 6. Check Database for Pre-Existing Registered Emails
    const existingMembers = await prisma.member.findMany({
      where: {
        email: { in: allEmails },
      },
      include: {
        team: {
          select: { teamId: true, teamName: true },
        },
      },
    });

    if (existingMembers.length > 0) {
      const conflictEmails = existingMembers.map((m) => `${m.email} (Team: ${m.team.teamName})`).join(', ');
      return NextResponse.json(
        {
          error: `Registration failed! The following email(s) are already registered in another team: ${conflictEmails}. A student can belong to AT MOST ONE team.`,
        },
        { status: 409 }
      );
    }

    // 7. Generate Official College Authorization Letter (DOCX & PDF)
    const letterResult = await generateCollegeAuthorizationLetter({
      teamName,
      psId: problemStatementId,
      psTitle: problemStatementTitle,
      leader: {
        name: leaderName,
        gender: leaderGender,
        email: leaderEmail,
        phone: leaderMobile,
      },
      members: members.map((m) => ({
        name: m.name,
        gender: m.gender,
        email: m.email,
        phone: m.phone,
      })),
    });

    // 8. Save Record in Database via Transaction
    const teamId = generateHumanTeamId();

    const createdTeam = await prisma.team.create({
      data: {
        teamId,
        teamName,
        problemStatementId,
        problemStatementTitle,
        pptUrl,
        pptFileName,
        authDocxPath: letterResult.docxPath,
        authPdfPath: letterResult.pdfPath,
        members: {
          create: [
            {
              name: leaderName,
              gender: leaderGender,
              email: leaderEmail,
              phone: leaderMobile,
              isLeader: true,
            },
            ...members.map((m) => ({
              name: m.name,
              gender: m.gender,
              email: m.email,
              phone: m.phone,
              isLeader: false,
            })),
          ],
        },
      },
    });

    // 9. CRITICAL SECURITY RESPONSE: Return ONLY plain success message to student. NO download link or file URL.
    return NextResponse.json(
      {
        success: true,
        message: `Registration submitted successfully for Team "${createdTeam.teamName}"! Your official SIH 2026 College Authorization Letter has been generated and sent to the college administration for principal signature and wet seal.`,
        teamId: createdTeam.teamId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Server error occurred during team registration.' },
      { status: 500 }
    );
  }
}
