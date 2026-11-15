export interface CompressedImageResult {
  file: File;
  blob: Blob;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  reductionPercent: number;
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Unable to decode image "${file.name}".`));
    };
    img.src = objectUrl;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas compression produced an empty image blob.'));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read compressed image blob.'));
    reader.readAsDataURL(blob);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Compresses and resizes an image using the HTML5 Canvas API.
 * Defaults to a maximum width of 800px and JPEG quality of 0.7.
 */
export async function compressImage(
  file: File,
  maxWidth = 800,
  quality = 0.7
): Promise<CompressedImageResult> {
  const img = await loadImageElement(file);
  const srcWidth = img.naturalWidth || img.width;
  const srcHeight = img.naturalHeight || img.height;

  const scale = srcWidth > maxWidth ? maxWidth / srcWidth : 1;
  const width = Math.max(1, Math.round(srcWidth * scale));
  const height = Math.max(1, Math.round(srcHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Browser Canvas 2D context is unavailable for image compression.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
  const compressedFile = new File([blob], `${baseName}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });

  const dataUrl = await blobToDataUrl(blob);
  const reductionPercent =
    file.size > 0
      ? Math.max(0, Math.round(((file.size - blob.size) / file.size) * 100))
      : 0;

  return {
    file: compressedFile,
    blob,
    dataUrl,
    originalSize: file.size,
    compressedSize: blob.size,
    width,
    height,
    reductionPercent,
  };
}
