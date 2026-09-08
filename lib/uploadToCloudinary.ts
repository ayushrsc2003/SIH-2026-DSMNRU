export interface CloudinaryUploadResult {
  pptUrl: string;
  publicId: string;
  fileName: string;
}

const MAX_PRESENTATION_BYTES = 10 * 1024 * 1024;

export async function uploadPresentationToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!['ppt', 'pptx'].includes(extension || '')) {
    throw new Error('Only .ppt and .pptx presentation files are allowed.');
  }
  if (file.size === 0 || file.size > MAX_PRESENTATION_BYTES) {
    throw new Error('The presentation file must be no larger than 10 MB. Please compress your presentation.');
  }

  // 1. Try client-side signed upload to Cloudinary
  try {
    const signatureResponse = await fetch('/api/upload/sign', { method: 'POST' });
    const signatureData = await signatureResponse.json();

    if (signatureResponse.ok && signatureData.apiKey && signatureData.cloudName) {
      const body = new FormData();
      body.append('file', file);
      body.append('api_key', signatureData.apiKey);
      body.append('timestamp', String(signatureData.timestamp));
      body.append('signature', signatureData.signature);
      body.append('folder', signatureData.folder);

      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${signatureData.cloudName}/raw/upload`, {
        method: 'POST',
        body,
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        if (uploadData.secure_url && uploadData.public_id) {
          return { pptUrl: uploadData.secure_url, publicId: uploadData.public_id, fileName: file.name };
        }
      }
    }
  } catch (directErr) {
    console.warn('Direct client-side Cloudinary upload failed, falling back to server upload proxy...', directErr);
  }

  // 2. Fallback to server-side upload proxy (/api/upload)
  try {
    const serverBody = new FormData();
    serverBody.append('file', file);

    const serverRes = await fetch('/api/upload', {
      method: 'POST',
      body: serverBody,
    });

    const serverData = await serverRes.json();
    if (!serverRes.ok || !serverData.pptUrl) {
      throw new Error(serverData.error || 'Server upload failed.');
    }

    return { pptUrl: serverData.pptUrl, publicId: serverData.publicId, fileName: file.name };
  } catch (fallbackErr: any) {
    console.error('All upload strategies failed:', fallbackErr);
    throw new Error(fallbackErr?.message || 'Failed to upload presentation file. Please verify Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).');
  }
}
