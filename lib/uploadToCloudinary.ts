export interface CloudinaryUploadResult {
  pptUrl: string;
  publicId: string;
  fileName: string;
}

const MAX_PRESENTATION_BYTES = 15 * 1024 * 1024;

export async function uploadPresentationToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!['ppt', 'pptx'].includes(extension || '')) {
    throw new Error('Only .ppt and .pptx presentation files are allowed.');
  }
  if (file.size === 0 || file.size > MAX_PRESENTATION_BYTES) {
    throw new Error('The presentation file must be no larger than 15 MB.');
  }

  const signatureResponse = await fetch('/api/upload/sign', { method: 'POST' });
  const signatureData = await signatureResponse.json();
  if (!signatureResponse.ok) {
    throw new Error(signatureData.error || 'Could not prepare the presentation upload.');
  }

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
  const uploadData = await uploadResponse.json();
  if (!uploadResponse.ok || !uploadData.secure_url || !uploadData.public_id) {
    throw new Error(uploadData.error?.message || 'Presentation upload failed. Please try again.');
  }

  return { pptUrl: uploadData.secure_url, publicId: uploadData.public_id, fileName: file.name };
}
