import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import PDFDocument from 'pdfkit';

export interface LetterData {
  teamName: string;
  psId: string;
  psTitle: string;
  leader: {
    name: string;
    gender: string;
    email: string;
    phone: string;
  };
  members: Array<{
    name: string;
    gender: string;
    email: string;
    phone: string;
  }>;
}

export async function generateCollegeAuthorizationLetter(data: LetterData) {
  const timestamp = Date.now();
  const sanitizedTeamName = data.teamName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filenameBase = `SIH2026_Auth_${sanitizedTeamName}_${timestamp}`;

  const collegeName = process.env.COLLEGE_NAME || "Institute of Engineering & Technology (IET), Dr. Shakuntala Misra National Rehabilitation University, Mohaan Road, Lucknow - 226017";
  const deanName = process.env.DEAN_NAME || "Prof. (Dr.) Dean / Director, IET DSMNRU";
  const submissionDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const outputDir = path.join(process.cwd(), 'storage', 'letters');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const docxFilename = `${filenameBase}.docx`;
  const pdfFilename = `${filenameBase}.pdf`;

  const docxPath = path.join(outputDir, docxFilename);
  const pdfPath = path.join(outputDir, pdfFilename);

  // 1. Generate DOCX file
  try {
    const templateDir = path.join(process.cwd(), 'public', 'templates');
    if (!fs.existsSync(templateDir)) {
      fs.mkdirSync(templateDir, { recursive: true });
    }
    const templatePath = path.join(templateDir, 'College-Authorization-letter-SIH2026.docx');

    let templateBuffer: Buffer;
    if (fs.existsSync(templatePath)) {
      templateBuffer = fs.readFileSync(templatePath);
    } else {
      // Create fallback valid docx template buffer if template file doesn't exist yet
      templateBuffer = createFallbackDocxTemplateBuffer();
    }

    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Populate template data
    doc.render({
      team_name: data.teamName,
      ps_id: data.psId,
      ps_title: data.psTitle,
      submission_date: submissionDate,
      leader_name: data.leader.name,
      leader_gender: data.leader.gender,
      leader_email: data.leader.email,
      leader_mobile: data.leader.phone,
      college_name: collegeName,
      dean_name: deanName,
      members: data.members.map((m, idx) => ({
        index: idx + 1,
        name: m.name,
        gender: m.gender,
        email: m.email,
        mobile: m.phone,
      })),
    });

    const generatedBuffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    fs.writeFileSync(docxPath, generatedBuffer);
  } catch (err) {
    console.error('Error generating DOCX letter:', err);
  }

  // 2. Generate PDF file via PDFKit
  await generatePdfFile({
    data,
    collegeName,
    deanName,
    submissionDate,
    pdfPath,
  });

  return {
    docxFilename,
    pdfFilename,
    docxPath,
    pdfPath,
  };
}

function generatePdfFile({
  data,
  collegeName,
  deanName,
  submissionDate,
  pdfPath,
}: {
  data: LetterData;
  collegeName: string;
  deanName: string;
  submissionDate: string;
  pdfPath: string;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const writeStream = fs.createWriteStream(pdfPath);

    doc.pipe(writeStream);

    // Header Banner
    doc
      .rect(40, 40, 515, 60)
      .fill('#0A0E17');

    doc
      .fillColor('#FF7A29')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('SMART INDIA HACKATHON 2026', 50, 52, { align: 'center' });

    doc
      .fillColor('#1FAE7A')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('OFFICIAL COLLEGE AUTHORIZATION LETTER', 50, 74, { align: 'center' });

    doc.moveDown(2);

    // Date & Institution
    doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold');
    doc.text(`Date: ${submissionDate}`, 40, 115, { align: 'right' });

    doc.fontSize(11).text('TO WHOM IT MAY CONCERN', 40, 135);
    doc.fontSize(10).font('Helvetica');
    doc.text(
      `This is to certify that the team "${data.teamName}" comprises regular students of ${collegeName}. They are officially authorized and nominated by the institution to participate in the Smart India Hackathon (SIH) 2026.`,
      40,
      155,
      { width: 515, align: 'justify' }
    );

    // Problem Statement Details Box
    doc.rect(40, 205, 515, 50).fillAndStroke('#F8FAFC', '#CBD5E1');
    doc.fillColor('#0F172A').fontSize(10).font('Helvetica-Bold');
    doc.text(`Problem Statement ID: `, 50, 215, { continued: true });
    doc.font('Helvetica').text(data.psId);
    doc.font('Helvetica-Bold').text(`Problem Statement Title: `, 50, 232, { continued: true });
    doc.font('Helvetica').text(data.psTitle);

    // Team Composition Details
    doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold');
    doc.text('Team Composition Details:', 40, 275);

    // Leader Box
    doc.rect(40, 295, 515, 45).fillAndStroke('#EFF6FF', '#93C5FD');
    doc.fillColor('#1E3A8A').fontSize(10).font('Helvetica-Bold');
    doc.text(`Team Leader: ${data.leader.name} (Gender: ${data.leader.gender})`, 50, 305);
    doc.font('Helvetica').fontSize(9).text(`Email: ${data.leader.email}  |  Mobile: ${data.leader.phone}`, 50, 320);

    // Members Table Header
    doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold').text('Team Members:', 40, 355);

    let y = 375;
    doc.rect(40, y, 515, 20).fill('#1E293B');
    doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
    doc.text('#', 45, y + 5);
    doc.text('Member Name', 70, y + 5);
    doc.text('Gender', 220, y + 5);
    doc.text('Email Address', 280, y + 5);
    doc.text('Mobile', 450, y + 5);

    y += 20;

    data.members.forEach((m, idx) => {
      const bg = idx % 2 === 0 ? '#F1F5F9' : '#FFFFFF';
      doc.rect(40, y, 515, 20).fillAndStroke(bg, '#E2E8F0');
      doc.fillColor('#0F172A').fontSize(9).font('Helvetica');
      doc.text(String(idx + 1), 45, y + 5);
      doc.text(m.name, 70, y + 5);
      doc.text(m.gender, 220, y + 5);
      doc.text(m.email, 280, y + 5);
      doc.text(m.phone, 450, y + 5);
      y += 20;
    });

    // Signatory / Authorization Footer
    y += 30;
    doc.fillColor('#000000').fontSize(9).font('Helvetica');
    doc.text('We hereby declare that all team members satisfy SIH 2026 eligibility criteria and the details provided above are true to the best of our knowledge.', 40, y, { width: 515 });

    y += 55;
    doc.font('Helvetica-Bold').fontSize(10).text('Authorized Signatory:', 40, y);
    doc.text('Official Seal / Stamp:', 350, y);

    y += 35;
    doc.font('Helvetica-Bold').fontSize(10).text(deanName, 40, y);
    doc.font('Helvetica').fontSize(9).text(collegeName, 40, y + 15, { width: 280 });

    doc.end();

    writeStream.on('finish', () => resolve());
    writeStream.on('error', (err) => reject(err));
  });
}

function createFallbackDocxTemplateBuffer(): Buffer {
  // Minimal valid Docx zip structure if file is absent
  const zip = new PizZip();
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>SMART INDIA HACKATHON 2026 AUTHORIZATION LETTER</w:t></w:r></w:p>
    <w:p><w:r><w:t>College Name: {college_name}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Team Name: {team_name}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Problem Statement ID: {ps_id}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Problem Statement Title: {ps_title}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Team Leader: {leader_name} ({leader_gender}) - {leader_email} - {leader_mobile}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Team Members:</w:t></w:r></w:p>
    {#members}
    <w:p><w:r><w:t>{index}. {name} | {gender} | {email} | {mobile}</w:t></w:r></w:p>
    {/members}
    <w:p><w:r><w:t>Authorized By: {dean_name}</w:t></w:r></w:p>
  </w:body>
</w:document>`;

  zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.file('word/document.xml', documentXml);

  return zip.generate({ type: 'nodebuffer' });
}
