import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../config/firebase';
import { compressImage } from '../utils/imageProcessor';

export async function uploadComplaintPhotographs(
  complaintId: string,
  files: File[]
): Promise<string[]> {
  if (files.length === 0) return [];

  const urls: string[] = [];
  for (let idx = 0; idx < files.length; idx += 1) {
    const compressed = await compressImage(files[idx], 800, 0.7);
    const filename = `photo_${idx + 1}_${Date.now()}.jpg`;

    try {
      const storageRef = ref(storage, `complaints/${complaintId}/${filename}`);
      await uploadBytes(storageRef, compressed.blob, {
        contentType: 'image/jpeg',
      });
      const downloadUrl = await getDownloadURL(storageRef);
      urls.push(downloadUrl);
    } catch {
      // Graceful fallback via Node.js backend if Storage bucket rules are not yet configured
      const response = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl: compressed.dataUrl, complaintId }),
      });

      if (!response.ok) {
        const errPayload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errPayload.error || 'Failed to upload complaint photograph.');
      }

      const payload = (await response.json()) as { url: string };
      urls.push(payload.url);
    }
  }

  return urls;
}
