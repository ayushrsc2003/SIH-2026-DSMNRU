import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { cloudinary, getCloudinaryConfig } from '@/lib/cloudinary';

export interface AuthorizationPdfData {
  collegeName?: string;
  teamName: string;
  psCode: string;
  psTitle: string;
  category: string;
  leaderName: string;
  leaderGender: string;
  leaderEmail: string;
  leaderPhone: string;
  leaderBranch: string;
  leaderYear: string;
  deanName?: string;
  members: Array<{
    name: string;
    gender: string;
    email: string;
    phone: string;
    branch: string;
    year: string;
  }>;
}

function toSafeName(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').slice(0, 60) || 'Team';
}

function uploadPdfToCloudinary(buffer: Buffer, publicId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Attempt 1: Upload as image/pdf for direct browser PDF viewing
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        format: 'pdf',
        folder: 'sih-2026/authorization_letters',
        public_id: publicId,
        overwrite: true,
      },
      (error, result) => {
        if (!error && result?.secure_url) {
          resolve(result.secure_url);
          return;
        }

        // Attempt 2: Fallback to raw resource upload
        const rawStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw',
            folder: 'sih-2026/authorization_letters',
            public_id: `${publicId}.pdf`,
            overwrite: true,
          },
          (rawErr, rawRes) => {
            if (rawErr || !rawRes?.secure_url) {
              reject(rawErr || error || new Error('Cloudinary did not return a valid PDF authorization letter URL.'));
              return;
            }
            resolve(rawRes.secure_url);
          }
        );
        rawStream.end(buffer);
      }
    );
    stream.end(buffer);
  });
}

export async function generateAuthorizationPdfBytes(data: AuthorizationPdfData): Promise<Uint8Array> {
  const templatePath = path.join(process.cwd(), 'public', 'templates', 'FINAL_COPY_AUTHORIZATION_LETTER.pdf');
  if (!fsSync.existsSync(templatePath)) {
    throw new Error(`Official authorization letter template not found at: ${templatePath}`);
  }

  const basePdfBytes = await fs.readFile(templatePath);
  const pdfDoc = await PDFDocument.load(basePdfBytes);
  const page = pdfDoc.getPages()[0];

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // 1. Draw Submission Date (DD-MM-YYYY)
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replace(/\//g, '-');

  page.drawText(dateStr, {
    x: 482,
    y: 617.5,
    size: 10,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  // 2. Draw Team Name
  // Cover pre-printed '< Team Name >' placeholder with a clean white box
  page.drawRectangle({
    x: 52,
    y: 520,
    width: 320,
    height: 16,
    color: rgb(1, 1, 1),
  });
  page.drawText(data.teamName.slice(0, 45), {
    x: 56,
    y: 523.5,
    size: 10,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  // 3. Populate 6 Table Rows
  const participants = [
    {
      name: data.leaderName,
      gender: data.leaderGender,
      email: data.leaderEmail,
      phone: data.leaderPhone,
      stream: data.leaderBranch || 'CSE',
      year: data.leaderYear || '3rd Year',
    },
    ...data.members.slice(0, 5).map((m) => ({
      name: m.name,
      gender: m.gender,
      email: m.email,
      phone: m.phone,
      stream: m.branch || 'CSE',
      year: m.year || '3rd Year',
    })),
  ];

  // Exact row Y baselines in FINAL_COPY_AUTHORIZATION_LETTER.pdf
  const rowYs = [462, 420, 377, 335, 292, 249];

  participants.forEach((m, idx) => {
    const y = rowYs[idx];
    if (typeof y !== 'number') return;

    // Col 1: Name (87.72 to 178.2)
    const cleanName = m.name.trim().slice(0, 20);
    page.drawText(cleanName, {
      x: 91,
      y,
      size: 8.5,
      font: idx === 0 ? fontBold : font,
      color: rgb(0, 0, 0),
    });

    // Col 2: Gender (M/F) (178.68 to 233.04)
    const genderLetter = m.gender.toUpperCase().startsWith('F') ? 'F' : 'M';
    page.drawText(genderLetter, {
      x: 202,
      y,
      size: 9,
      font,
      color: rgb(0, 0, 0),
    });

    // Col 3: Email (233.52 to 376.68)
    const cleanEmail = m.email.trim();
    const displayEmail = cleanEmail.length > 25 ? `${cleanEmail.slice(0, 23)}...` : cleanEmail;
    page.drawText(displayEmail, {
      x: 236,
      y,
      size: 7.5,
      font,
      color: rgb(0, 0, 0),
    });

    // Col 4: Mobile no. (377.16 to 447.48)
    const cleanPhone = m.phone.trim();
    page.drawText(cleanPhone, {
      x: 380,
      y,
      size: 8.5,
      font,
      color: rgb(0, 0, 0),
    });

    // Col 5: Stream / Branch (447.96 to 511.32)
    const cleanStream = m.stream.trim().slice(0, 10);
    page.drawText(cleanStream, {
      x: 452,
      y,
      size: 8.5,
      font,
      color: rgb(0, 0, 0),
    });

    // Col 6: Academic Year (511.8 to 582.12)
    const cleanYear = m.year.trim().slice(0, 10);
    page.drawText(cleanYear, {
      x: 516,
      y,
      size: 8.5,
      font,
      color: rgb(0, 0, 0),
    });
  });

  return pdfDoc.save();
}

export async function generateAuthorizationPdf(data: AuthorizationPdfData): Promise<string> {
  const modifiedPdfBytes = await generateAuthorizationPdfBytes(data);
  const pdfBuffer = Buffer.from(modifiedPdfBytes);

  try {
    getCloudinaryConfig();
    const publicId = `SIH2026_Auth_${toSafeName(data.teamName)}_${Date.now()}`;
    return await uploadPdfToCloudinary(pdfBuffer, publicId);
  } catch (cloudErr) {
    console.warn('Cloudinary upload warning:', cloudErr);
    return `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
  }
}
