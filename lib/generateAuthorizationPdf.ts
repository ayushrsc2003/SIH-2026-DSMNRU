import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import PDFDocumentKit from 'pdfkit';
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

function uploadRawPdf(buffer: Buffer, publicId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'sih-2026/authorization_letters',
        public_id: `${publicId}.pdf`,
        overwrite: true,
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error || new Error('Cloudinary did not return a valid PDF authorization letter URL.'));
          return;
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

function createBaseTemplateIfMissing(templatePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fsSync.existsSync(templatePath)) {
      return resolve();
    }

    try {
      const parentDir = path.dirname(templatePath);
      if (!fsSync.existsSync(parentDir)) {
        fsSync.mkdirSync(parentDir, { recursive: true });
      }

      const doc = new PDFDocumentKit({
        size: 'A4',
        margin: 36,
        info: { Title: 'SIH 2026 Official College Authorization Letter' },
      });

      const writeStream = fsSync.createWriteStream(templatePath);
      doc.pipe(writeStream);

      const width = doc.page.width;
      const left = 36;
      const right = width - 36;
      const contentWidth = right - left;

      // Header top line
      doc.rect(left, 115, contentWidth, 1.5).fill('#000000');

      // Top Left Header
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10).text('Prof. C.K. Dixit,', left, 40);
      doc.font('Helvetica-Bold').fontSize(9).text('Dean, Faculty of Engineering & Technology', left, 54);
      doc.font('Helvetica').fontSize(8.5).text('Faculty of Engineering & Technology', left, 68);

      // Top Center Emblem Circle
      const centerX = width / 2;
      doc.circle(centerX, 68, 26).lineWidth(1.5).stroke('#000000');
      doc.circle(centerX, 68, 22).lineWidth(0.8).stroke('#000000');
      doc.font('Helvetica-Bold').fontSize(7).text('UP GOVT', centerX - 16, 61);
      doc.font('Helvetica').fontSize(6).text('DSMNRU', centerX - 13, 71);

      // Top Right Header
      const rightBlockX = width - 260;
      doc.font('Helvetica-Bold').fontSize(8.5).text('Dr. Shakuntala Misra National Rehabilitation University, Lucknow', rightBlockX, 40, { width: 224, align: 'right' });
      doc.font('Helvetica').fontSize(8).text('Government of Uttar Pradesh, Mohan Road, Lucknow - 226017', rightBlockX, 64, { width: 224, align: 'right' });
      doc.font('Helvetica').fontSize(7.5).text('Phone: 0522-2999862 | Website: http://dsmnru.up.nic.in', rightBlockX, 86, { width: 224, align: 'right' });

      // Reference and Date
      doc.font('Helvetica-Bold').fontSize(10.5).text('Ref.       /FOET/ B.TECH/DSMNRU/ 2025-26', left + 10, 138);
      doc.font('Helvetica-Bold').fontSize(10.5).text('Date:', right - 130, 138);

      // Subject
      doc.font('Helvetica-Bold').fontSize(12).text('Sub: Smart India Hackathon 2026 – Nomination', left, 172, { width: contentWidth, align: 'center' });

      // Paragraph
      const para = 'I am pleased to nominate the below team from our college to participate in Smart India Hackathon 2026. AICTE Application No/ UGC Registration No for our college is U-0512.';
      doc.font('Helvetica').fontSize(10).text(para, left, 204, { width: contentWidth, lineGap: 3 });

      // Team Header
      doc.font('Helvetica-Bold').fontSize(10.5).text('Team : < Team Name >', left, 240);

      // Table Setup
      const tableTop = 258;
      const colWidths = [72, 90, 52, 136, 68, 52, 53.28];
      const colX = [left];
      for (let i = 0; i < colWidths.length; i++) {
        colX.push(colX[i] + colWidths[i]);
      }
      const headerH = 26;
      const rowH = 32;
      const totalH = headerH + (6 * rowH);

      // Table Outer & Inner Grid
      doc.rect(left, tableTop, contentWidth, totalH).lineWidth(1).stroke('#000000');
      doc.moveTo(left, tableTop + headerH).lineTo(right, tableTop + headerH).lineWidth(1).stroke('#000000');

      for (let r = 1; r <= 6; r++) {
        const y = tableTop + headerH + (r * rowH);
        doc.moveTo(left, y).lineTo(right, y).lineWidth(0.8).stroke('#000000');
      }

      for (let c = 1; c < colX.length - 1; c++) {
        doc.moveTo(colX[c], tableTop).lineTo(colX[c], tableTop + totalH).lineWidth(0.8).stroke('#000000');
      }

      // Header Texts
      doc.font('Helvetica-Bold').fontSize(8.5);
      doc.text('Role', colX[0] + 5, tableTop + 8);
      doc.text('Name', colX[1] + 5, tableTop + 8);
      doc.text('Gender\n(M/F)', colX[2] + 4, tableTop + 4);
      doc.text('Email id', colX[3] + 5, tableTop + 8);
      doc.text('Mobile no.', colX[4] + 4, tableTop + 8);
      doc.text('Stream', colX[5] + 4, tableTop + 8);
      doc.text('Academic\nYear', colX[6] + 4, tableTop + 4);

      // Pre-printed Column 1 Roles
      const roles = ['Team Leader', 'Team Member', 'Team Member', 'Team Member', 'Team Member', 'Team Member'];
      roles.forEach((role, idx) => {
        const y = tableTop + headerH + (idx * rowH) + 11;
        doc.font(idx === 0 ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.5).text(role, colX[0] + 5, y);
      });

      // Stamp & Sign in Blue
      const stampX = right - 220;
      const stampY = 510;

      // Signature strokes in blue
      doc.save();
      doc.strokeColor('#0f2b82').lineWidth(2);
      doc.moveTo(stampX - 15, stampY + 28).bezierCurveTo(stampX + 20, stampY + 60, stampX + 70, stampY + 10, stampX + 110, stampY + 42).stroke();
      doc.moveTo(stampX + 10, stampY + 45).lineTo(stampX + 130, stampY + 22).lineWidth(1.5).stroke();
      doc.restore();

      // Official Stamp Box text in Blue
      doc.fillColor('#0f2b82').font('Helvetica-Bold').fontSize(8.5).text('Prof. C.K. Dixit, Dean', stampX, stampY + 28);
      doc.font('Helvetica-Bold').fontSize(7.5).text('Faculty of Engineering & Technology (FOET)', stampX, stampY + 40);
      doc.font('Helvetica-Bold').fontSize(7.5).text('Dr. Shakuntala Misra National Rehabilitation University', stampX, stampY + 52);

      // Official English Subtext
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9.5).text('(Prof. C.K. Dixit)', stampX + 20, stampY + 76);
      doc.font('Helvetica').fontSize(9).text('Dean,', stampX + 50, stampY + 89);
      doc.font('Helvetica-Bold').fontSize(8.5).text('Faculty of Engineering & Technology', stampX - 10, stampY + 101);

      doc.end();
      writeStream.on('finish', () => resolve());
      writeStream.on('error', (err) => reject(err));
    } catch (e) {
      reject(e);
    }
  });
}

export async function generateAuthorizationPdf(data: AuthorizationPdfData): Promise<string> {
  getCloudinaryConfig();

  const templatePath = path.join(process.cwd(), 'public', 'templates', 'FINAL_COPY_AUTHORIZATION_LETTER.pdf');
  await createBaseTemplateIfMissing(templatePath);

  const basePdfBytes = await fs.readFile(templatePath);
  const pdfDoc = await PDFDocument.load(basePdfBytes);
  const pages = pdfDoc.getPages();
  const page = pages[0];
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // 1. Draw Submission Date (DD/MM/YYYY)
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  page.drawText(dateStr, {
    x: width - 96,
    y: height - 146,
    size: 9.5,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  // 2. Draw Team Name
  page.drawRectangle({
    x: 76,
    y: height - 250,
    width: 320,
    height: 14,
    color: rgb(1, 1, 1),
  });
  page.drawText(data.teamName.slice(0, 45), {
    x: 78,
    y: height - 248,
    size: 10.5,
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
      year: data.leaderYear || '2023-2027',
    },
    ...data.members.slice(0, 5).map((m) => ({
      name: m.name,
      gender: m.gender,
      email: m.email,
      phone: m.phone,
      stream: m.branch || 'CSE',
      year: m.year || '2023-2027',
    })),
  ];

  const colX = [36, 108, 198, 250, 386, 454, 506];

  participants.forEach((m, idx) => {
    const y = height - (300 + idx * 32);

    // Name
    const cleanName = m.name.trim().slice(0, 18);
    page.drawText(cleanName, {
      x: colX[1] + 4,
      y,
      size: 8,
      font: idx === 0 ? fontBold : font,
      color: rgb(0, 0, 0),
    });

    // Gender (M/F)
    const genderLetter = m.gender.toUpperCase().startsWith('F') ? 'F' : 'M';
    page.drawText(genderLetter, {
      x: colX[2] + 18,
      y,
      size: 8.5,
      font,
      color: rgb(0, 0, 0),
    });

    // Email
    const cleanEmail = m.email.trim();
    const displayEmail = cleanEmail.length > 25 ? `${cleanEmail.slice(0, 24)}..` : cleanEmail;
    page.drawText(displayEmail, {
      x: colX[3] + 4,
      y,
      size: 7.5,
      font,
      color: rgb(0, 0, 0),
    });

    // Mobile no.
    const cleanPhone = m.phone.trim();
    page.drawText(cleanPhone, {
      x: colX[4] + 4,
      y,
      size: 8,
      font,
      color: rgb(0, 0, 0),
    });

    // Stream / Branch
    const cleanStream = m.stream.trim().slice(0, 10);
    page.drawText(cleanStream, {
      x: colX[5] + 4,
      y,
      size: 8,
      font,
      color: rgb(0, 0, 0),
    });

    // Academic Year
    const cleanYear = m.year.trim().slice(0, 10);
    page.drawText(cleanYear, {
      x: colX[6] + 4,
      y,
      size: 8,
      font,
      color: rgb(0, 0, 0),
    });
  });

  const modifiedPdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(modifiedPdfBytes);

  const publicId = `SIH2026_Auth_${toSafeName(data.teamName)}_${Date.now()}`;
  return uploadRawPdf(pdfBuffer, publicId);
}
