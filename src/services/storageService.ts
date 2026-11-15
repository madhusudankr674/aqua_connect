import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../config/firebase';

async function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1280;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = () => reject(new Error('Could not decode image file.'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.readAsDataURL(file);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/data:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export async function uploadComplaintPhotographs(
  complaintId: string,
  files: File[]
): Promise<string[]> {
  if (files.length === 0) return [];

  const urls: string[] = [];
  for (let idx = 0; idx < files.length; idx += 1) {
    const file = files[idx];
    const compressedDataUrl = await compressImageToDataUrl(file);
    const compressedBlob = dataUrlToBlob(compressedDataUrl);
    const filename = `photo_${idx + 1}_${Date.now()}.jpg`;

    try {
      const storageRef = ref(storage, `complaints/${complaintId}/${filename}`);
      await uploadBytes(storageRef, compressedBlob, { contentType: 'image/jpeg' });
      const downloadUrl = await getDownloadURL(storageRef);
      urls.push(downloadUrl);
    } catch {
      // Graceful fallback via Node.js backend if Storage bucket rules are not yet configured
      const response = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl: compressedDataUrl, complaintId }),
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
