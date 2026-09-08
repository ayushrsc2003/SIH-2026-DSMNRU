import fs from 'fs/promises';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { cloudinary, getCloudinaryConfig } from '@/lib/cloudinary';

export interface AuthorizationLetterData {
  collegeName: string;
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
  deanName: string;
  members: Array<{ name: string; gender: string; email: string; phone: string; branch: string; year: string }>;
}

function toSafeName(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').slice(0, 80) || 'team';
}

function uploadRawDocument(buffer: Buffer, publicId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'sih-2026/authorization_letters',
        public_id: publicId,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error || new Error('Cloudinary did not return an authorization letter URL.'));
          return;
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

export async function generateAuthorizationLetter(data: AuthorizationLetterData): Promise<string> {
  getCloudinaryConfig();
  const templatePath = path.join(process.cwd(), 'public', 'templates', 'College-Authorization-letter-SIH2026-official.docx');
  const template = await fs.readFile(templatePath);
  const document = new Docxtemplater(new PizZip(template), {
    delimiters: { start: '{{', end: '}}' },
    paragraphLoop: false,
    linebreaks: true,
  });

  const memberFields = Object.fromEntries(
    Array.from({ length: 5 }, (_, index) => {
      const member = data.members[index];
      const number = index + 1;
      return [
        [`member_${number}_name`, member?.name || ''],
        [`member_${number}_gender`, member?.gender || ''],
        [`member_${number}_email`, member?.email || ''],
        [`member_${number}_phone`, member?.phone || ''],
        [`member_${number}_branch`, member?.branch || ''],
        [`member_${number}_year`, member?.year || ''],
      ];
    }).flat()
  );

  document.render({
    college_name: data.collegeName,
    submission_date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
    team_name: data.teamName,
    ps_code: data.psCode,
    ps_title: data.psTitle,
    category: data.category,
    leader_name: data.leaderName,
    leader_gender: data.leaderGender,
    leader_email: data.leaderEmail,
    leader_phone: data.leaderPhone,
    leader_branch: data.leaderBranch,
    leader_year: data.leaderYear,
    dean_name: data.deanName,
    members: data.members,
    ...memberFields,
  });

  const buffer = document.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
  const filename = `SIH2026_Authorization_${toSafeName(data.teamName)}_${Date.now()}.docx`;
  return uploadRawDocument(buffer, filename);
}
