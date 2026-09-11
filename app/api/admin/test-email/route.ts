import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { verifyAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenParam = searchParams.get('token') || '';
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim() || tokenParam;
    const adminToken = process.env.ADMIN_TOKEN || 'sih2026_admin_secret_token_key';

    const isTokenValid = token === adminToken;
    const isCookieValid = verifyAdminSession();

    if (!isTokenValid && !isCookieValid) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 403 });
    }

    const rawUser = process.env.GMAIL_USER || process.env.EMAIL_USER || 'ayushchaurasiya.ietdsmnru@gmail.com';
    const gmailUser = rawUser.trim().replace(/^["']|["']$/g, '');

    const rawPass = process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASSWORD || process.env.GMAIL_PASS || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || '';
    const gmailPass = rawPass.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');

    if (!gmailPass) {
      return NextResponse.json({
        success: false,
        status: 'MISSING_PASSWORD',
        message: 'GMAIL_APP_PASSWORD is not set in Render environment variables. Please add GMAIL_APP_PASSWORD in Render Dashboard.',
        gmailUser,
        hasPassword: false,
      }, { status: 400 });
    }

    let info: any;
    let usedPort = 465;

    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        family: 4, // Force IPv4 to bypass Render container IPv6 ENETUNREACH
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      } as any);

      await transporter.verify();

      info = await transporter.sendMail({
        from: `"SIH 2026 Test Mailer" <${gmailUser}>`,
        to: gmailUser,
        subject: `SIH 2026 DSMNRU - Gmail SMTP Test Email (${new Date().toLocaleTimeString('en-IN')})`,
        html: `
          <div style="font-family:Arial,sans-serif;padding:20px;border:1px solid #e5e7eb;border-radius:8px;">
            <h2 style="color:#059669;">✓ Gmail SMTP Configured Successfully!</h2>
            <p>This is a diagnostic test email sent directly from your SIH 2026 portal via <strong>${gmailUser}</strong>.</p>
            <p>Registration emails will now be delivered to candidate inboxes automatically.</p>
          </div>
        `,
      });
    } catch (primaryErr: any) {
      console.warn('Port 465 failed, trying port 587 with IPv4:', primaryErr?.message);
      usedPort = 587;
      const fallbackTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // STARTTLS
        family: 4,
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      } as any);

      await fallbackTransporter.verify();

      info = await fallbackTransporter.sendMail({
        from: `"SIH 2026 Test Mailer" <${gmailUser}>`,
        to: gmailUser,
        subject: `SIH 2026 DSMNRU - Gmail SMTP Test Email Port 587 (${new Date().toLocaleTimeString('en-IN')})`,
        html: `
          <div style="font-family:Arial,sans-serif;padding:20px;border:1px solid #e5e7eb;border-radius:8px;">
            <h2 style="color:#059669;">✓ Gmail SMTP Configured Successfully (Port 587)!</h2>
            <p>This is a diagnostic test email sent directly from your SIH 2026 portal via <strong>${gmailUser}</strong>.</p>
            <p>Registration emails will now be delivered to candidate inboxes automatically.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      status: 'VERIFIED_AND_SENT',
      message: `Test email successfully sent to ${gmailUser} via port ${usedPort}`,
      messageId: info.messageId,
      gmailUser,
      usedPort,
      hasPassword: true,
      passwordLength: gmailPass.length,
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      status: 'SMTP_ERROR',
      error: error.message || 'SMTP Authentication failed',
      code: error.code || null,
      response: error.response || null,
      instructions: error.message?.includes('Username and Password not accepted')
        ? 'Google rejected the password. Make sure you use a 16-letter App Password generated from https://myaccount.google.com/apppasswords, not your regular Gmail account login password.'
        : 'Please verify your GMAIL_USER and GMAIL_APP_PASSWORD.',
    }, { status: 500 });
  }
}
