import { NextResponse } from 'next/server';
import { cloudinary, getCloudinaryConfig } from '@/lib/cloudinary';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'sih-2026/presentations';
    const signature = cloudinary.utils.api_sign_request({ folder, timestamp }, apiSecret);

    return NextResponse.json({ signature, timestamp, apiKey, cloudName, folder });
  } catch (error) {
    console.error('Cloudinary upload signature error:', error);
    return NextResponse.json({ error: 'Presentation upload is not configured.' }, { status: 503 });
  }
}
