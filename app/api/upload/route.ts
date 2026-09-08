import { NextResponse } from 'next/server';
import { cloudinary, getCloudinaryConfig } from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    getCloudinaryConfig();
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['ppt', 'pptx'].includes(extension || '')) {
      return NextResponse.json({ error: 'Only .ppt and .pptx files are allowed.' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json({ error: `File size (${sizeMB} MB) exceeds Cloudinary 10 MB limit. Please compress images in your PPT and try again.` }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const rawBaseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
    const publicId = `ppt_${Date.now()}_${rawBaseName || 'presentation'}`;

    const uploadResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'sih-2026/presentations',
          public_id: publicId,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({
      pptUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error('Server upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload presentation. Check Cloudinary settings.' },
      { status: 500 }
    );
  }
}
