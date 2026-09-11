import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export interface EmailParticipant {
  name: string;
  email: string;
  phone: string;
  branch: string;
  year: string;
  gender?: string;
}

export interface SendConfirmationEmailParams {
  teamId: string;
  teamName: string;
  psCode: string;
  psTitle: string;
  category: string;
  leader: EmailParticipant;
}

function escapeHtml(value: string | undefined | null): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendConfirmationEmail({
  teamId,
  teamName,
  psCode,
  psTitle,
  category,
  leader,
}: SendConfirmationEmailParams): Promise<{ success: boolean; provider: string; error?: string }> {
  const gmailUser = (process.env.GMAIL_USER || 'ayushchaurasiya.ietdsmnru@gmail.com').trim();
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASSWORD || process.env.EMAIL_PASS || '').trim().replace(/\s+/g, '');

  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const resendFrom = process.env.RESEND_FROM?.trim();

  const values = [
    ['Team ID', teamId],
    ['Team Name', teamName],
    ['Problem Statement', `${psCode} - ${psTitle}`],
    ['Category', category],
    ['Team Leader', leader.name],
    ['Leader Email', leader.email],
    ['Leader Mobile', leader.phone],
    ['Branch / Stream', leader.branch],
    ['Academic Year', leader.year],
  ];

  const tableRows = values
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;color:#374151;width:35%;">${escapeHtml(label)}</td>
          <td style="padding:10px 14px;border:1px solid #e5e7eb;color:#111827;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join('');

  const subject = `SIH 2026 Registration Confirmed - Team ${teamName} (${teamId})`;

  const htmlContent = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;color:#111827;max-width:640px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background:#ffffff;">
      <div style="background:#0b132b;padding:24px 28px;text-align:center;border-bottom:3px solid #f97316;">
        <h2 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">SMART INDIA HACKATHON 2026</h2>
        <p style="margin:6px 0 0 0;color:#cbd5e1;font-size:13px;">Internal College Hackathon Round | IET DSMNRU Lucknow</p>
      </div>

      <div style="padding:28px 24px;">
        <div style="background:#ecfdf5;border:1px solid #a7f3d0;padding:12px 16px;border-radius:8px;margin-bottom:20px;">
          <p style="margin:0;color:#065f46;font-size:14px;font-weight:600;">
            ✓ Registration Received &amp; Verified
          </p>
        </div>

        <p style="font-size:15px;line-height:1.6;margin-top:0;">
          Dear <strong>${escapeHtml(leader.name)}</strong>,
        </p>
        <p style="font-size:14px;line-height:1.6;color:#374151;">
          Your team registration for the <strong>Smart India Hackathon 2026 (Internal Screening Round)</strong> at the Institute of Engineering &amp; Technology (IET), Dr. Shakuntala Misra National Rehabilitation University, has been successfully recorded.
        </p>

        <div style="margin:22px 0;">
          <h3 style="font-size:14px;font-weight:700;color:#1e293b;margin:0 0 10px 0;text-transform:uppercase;letter-spacing:0.5px;">Team Summary</h3>
          <table style="border-collapse:collapse;width:100%;font-size:13.5px;">
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:16px 20px;border-radius:8px;margin:24px 0;font-size:13px;line-height:1.6;">
          <p style="margin:0 0 8px 0;font-weight:700;color:#0f172a;font-size:14px;">
            📌 Next Steps &amp; Important Instructions:
          </p>
          <ul style="margin:0;padding-left:20px;color:#334155;">
            <li style="margin-bottom:6px;"><strong>Internal Hackathon Days:</strong> 15th &amp; 16th September 2026 (IET DSMNRU Campus, Lucknow).</li>
            <li style="margin-bottom:6px;"><strong>Authorization Letter:</strong> Your official college authorization letter has been dynamically generated with UGC code <code>U-0512</code> and sent directly to the college administration desk &amp; Dean office for faculty validation.</li>
            <li style="margin-bottom:6px;"><strong>What to bring:</strong> Bring your university student ID cards and laptops for live presentation/screening on hackathon day.</li>
          </ul>
        </div>

        <div style="border-top:1px solid #e5e7eb;padding-top:18px;margin-top:24px;font-size:12.5px;color:#64748b;line-height:1.5;">
          <p style="margin:0 0 4px 0;"><strong>SIH 2026 Organizing Committee</strong></p>
          <p style="margin:0 0 4px 0;">Institute of Engineering &amp; Technology (IET)</p>
          <p style="margin:0 0 4px 0;">Dr. Shakuntala Misra National Rehabilitation University, Mohan Road, Lucknow - 226017</p>
          <p style="margin:0;">Student Coordinator: <a href="mailto:achaurasiya_csebtech23_041@dsmnru.ac.in" style="color:#f97316;text-decoration:none;">achaurasiya_csebtech23_041@dsmnru.ac.in</a></p>
        </div>
      </div>
    </div>
  `;

  // 1. Attempt Sending via Gmail SMTP (Nodemailer)
  if (gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      await transporter.sendMail({
        from: `"SIH 2026 DSMNRU" <${gmailUser}>`,
        to: leader.email,
        replyTo: 'achaurasiya_csebtech23_041@dsmnru.ac.in',
        subject,
        html: htmlContent,
      });

      console.log(`[MAILER] Registration confirmation email successfully sent to ${leader.email} via Gmail SMTP (${gmailUser}).`);
      return { success: true, provider: 'gmail_smtp' };
    } catch (gmailErr: any) {
      console.error('[MAILER] Gmail SMTP sending error:', gmailErr?.message || gmailErr);
    }
  } else {
    console.warn('[MAILER] GMAIL_APP_PASSWORD is not set in environment variables.');
  }

  // 2. Fallback to Resend if configured
  if (resendApiKey && resendFrom) {
    try {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: resendFrom,
        to: leader.email,
        replyTo: 'achaurasiya_csebtech23_041@dsmnru.ac.in',
        subject,
        html: htmlContent,
      });

      console.log(`[MAILER] Registration confirmation email sent to ${leader.email} via Resend.`);
      return { success: true, provider: 'resend' };
    } catch (resendErr: any) {
      console.error('[MAILER] Resend fallback error:', resendErr?.message || resendErr);
      return { success: false, provider: 'resend', error: resendErr?.message };
    }
  }

  return {
    success: false,
    provider: 'none',
    error: 'No email service credentials configured. Set GMAIL_APP_PASSWORD in Render environment variables.',
  };
}
