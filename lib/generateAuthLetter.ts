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
      templateBuffer = createFallbackDocxTemplateBuffer();
    }

    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

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

  // 2. Generate a real, print-ready PDF. Never write DOCX bytes to a .pdf file:
  // that results in a corrupt download which PDF readers cannot open.
  try {
    await generatePdfFileSafe({
      data,
      collegeName,
      deanName,
      submissionDate,
      pdfPath,
    });
  } catch (pdfErr) {
    console.error('Error generating PDF letter:', pdfErr);
    if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    throw new Error('The authorization letter PDF could not be generated. Please try the submission again.');
  }

  return {
    docxFilename,
    pdfFilename,
    docxPath,
    pdfPath,
  };
}

function generatePdfFileSafe({
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
    try {
      const doc = new PDFDocument({ margin: 46, size: 'A4', info: { Title: 'SIH 2026 College Authorization Letter' } });
      const writeStream = fs.createWriteStream(pdfPath);

      writeStream.on('finish', () => resolve());
      writeStream.on('error', (err) => reject(err));

      doc.pipe(writeStream);

      const left = 46;
      const width = 503;
      const bottom = 760;
      const addHeader = () => {
        doc.rect(left, 42, width, 58).fill('#0A0E17');
        doc.fillColor('#FF7A29').font('Helvetica-Bold').fontSize(16).text('SMART INDIA HACKATHON 2026', left + 10, 54, { width: width - 20, align: 'center' });
        doc.fillColor('#FFFFFF').font('Helvetica').fontSize(10).text('COLLEGE AUTHORIZATION LETTER', left + 10, 77, { width: width - 20, align: 'center' });
        doc.y = 118;
      };
      const ensureSpace = (height: number) => {
        if (doc.y + height > bottom) {
          doc.addPage();
          addHeader();
        }
      };
      const line = (label: string, value: string) => {
        doc.font('Helvetica-Bold').text(label, left, doc.y, { continued: true });
        doc.font('Helvetica').text(value);
      };

      addHeader();
      doc.fillColor('#111827').font('Helvetica').fontSize(10).text(`Date: ${submissionDate}`, { align: 'right' });
      doc.moveDown(1.4);
      doc.font('Helvetica-Bold').fontSize(11).text('TO WHOM IT MAY CONCERN');
      doc.moveDown(0.7);
      doc.font('Helvetica').fontSize(10).text(
        `This is to certify that the team “${data.teamName}” comprises regular students of ${collegeName}. The institution hereby authorizes and nominates the team to participate in Smart India Hackathon (SIH) 2026.`,
        { width, align: 'justify', lineGap: 3 }
      );
      doc.moveDown(1.2);

      const psHeight = Math.max(60, doc.heightOfString(`Problem Statement Title: ${data.psTitle}`, { width: width - 24 }) + 38);
      ensureSpace(psHeight + 18);
      const psTop = doc.y;
      doc.rect(left, psTop, width, psHeight).fillAndStroke('#F8FAFC', '#CBD5E1');
      doc.fillColor('#111827').fontSize(10);
      doc.font('Helvetica-Bold').text('Problem Statement ID: ', left + 12, psTop + 10, { continued: true });
      doc.font('Helvetica').text(data.psId);
      doc.font('Helvetica-Bold').text('Problem Statement Title: ', left + 12, doc.y + 4, { continued: true });
      doc.font('Helvetica').text(data.psTitle, { width: width - 24 });
      doc.y = psTop + psHeight + 20;

      doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text('Team Composition Details');
      doc.moveDown(0.6);
      const leaderHeight = Math.max(54, doc.heightOfString(`Team Leader: ${data.leader.name} (${data.leader.gender})\nEmail: ${data.leader.email}   |   Mobile: ${data.leader.phone}`, { width: width - 24 }) + 20);
      ensureSpace(leaderHeight + 25);
      const leaderTop = doc.y;
      doc.rect(left, leaderTop, width, leaderHeight).fillAndStroke('#EFF6FF', '#93C5FD');
      doc.fillColor('#1E3A8A').fontSize(10);
      line('Team Leader: ', `${data.leader.name} (${data.leader.gender})`);
      doc.moveDown(0.25);
      line('Email: ', `${data.leader.email}   |   Mobile: ${data.leader.phone}`);
      doc.y = leaderTop + leaderHeight + 18;

      ensureSpace(50);
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(10).text('Team Members');
      doc.moveDown(0.5);
      data.members.forEach((member, index) => {
        const memberText = `${index + 1}. ${member.name} (${member.gender})\n   Email: ${member.email}   |   Mobile: ${member.phone}`;
        const rowHeight = Math.max(38, doc.heightOfString(memberText, { width: width - 20 }) + 14);
        ensureSpace(rowHeight + 4);
        const rowTop = doc.y;
        doc.rect(left, rowTop, width, rowHeight).fillAndStroke(index % 2 === 0 ? '#F8FAFC' : '#FFFFFF', '#E2E8F0');
        doc.fillColor('#111827').font('Helvetica').fontSize(9).text(memberText, left + 10, rowTop + 7, { width: width - 20, lineGap: 2 });
        doc.y = rowTop + rowHeight + 4;
      });

      const declaration = 'We hereby declare that all team members satisfy the SIH 2026 eligibility criteria and that the information above is true to the best of our knowledge.';
      ensureSpace(150);
      doc.moveDown(1.1);
      doc.fillColor('#111827').font('Helvetica').fontSize(9).text(declaration, { width, align: 'justify', lineGap: 2 });
      doc.moveDown(3.2);
      doc.font('Helvetica-Bold').fontSize(10).text('Authorized Signatory', left);
      doc.font('Helvetica').fontSize(9).text(deanName, left, doc.y + 5);
      doc.text(collegeName, { width: 290 });
      doc.font('Helvetica').fontSize(9).text('Official Seal / Stamp', left + 340, doc.y - 28, { width: 150, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function createFallbackDocxTemplateBuffer(): Buffer {
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
