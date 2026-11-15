import type {
  ComplaintCategory,
  ComplaintFormInput,
  ComplaintWard,
} from '../types/complaint';

export const VALID_WARDS: ComplaintWard[] = [
  'Ward 2',
  'Ward 4',
  'Ward 1',
  'Ward 3',
  'Ward 5',
  'Other',
];

export const VALID_CATEGORIES: ComplaintCategory[] = [
  'Muddy or cloudy water',
  'Unusual colour',
  'Unusual smell',
  'Unusual taste',
  'Visible particles',
  'Pipeline leakage',
  'Irregular water supply',
  'Low water pressure',
  'Other',
];

export const MAX_IMAGE_FILES = 3;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export interface ValidationErrors {
  citizenName?: string;
  mobile?: string;
  ward?: string;
  locality?: string;
  category?: string;
  description?: string;
  landmark?: string;
  observationDate?: string;
  coordinates?: string;
}

export function sanitizeMobile(raw: string): string {
  return raw.replace(/[^0-9+]/g, '').slice(0, 15);
}

export function extractMobileLast4(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  return digits.slice(-4).padStart(4, '0');
}

export function validateComplaintInput(input: ComplaintFormInput): ValidationErrors {
  const errors: ValidationErrors = {};

  const name = input.citizenName.trim();
  if (name.length < 2 || name.length > 100) {
    errors.citizenName = 'Please enter your full name (2 to 100 characters).';
  }

  const digitsOnly = input.mobile.replace(/\D/g, '');
  if (digitsOnly.length < 10 || digitsOnly.length > 13) {
    errors.mobile = 'Please enter a valid 10-digit mobile number.';
  }

  if (!VALID_WARDS.includes(input.ward)) {
    errors.ward = 'Please select a valid ward.';
  }

  const locality = input.locality.trim();
  if (locality.length < 2 || locality.length > 120) {
    errors.locality = 'Please enter your village or locality (2 to 120 characters).';
  }

  if (!VALID_CATEGORIES.includes(input.category)) {
    errors.category = 'Please select an observation category.';
  }

  const description = input.description.trim();
  if (description.length < 10 || description.length > 2000) {
    errors.description = 'Please provide a clear observation description (10 to 2000 characters).';
  }

  const landmark = input.landmark.trim();
  if (landmark.length < 2 || landmark.length > 200) {
    errors.landmark = 'Please enter a nearby landmark (2 to 200 characters).';
  }

  if (!input.observationDate || input.observationDate.trim().length < 8) {
    errors.observationDate = 'Please select the date and time of observation.';
  }

  if (
    (input.latitude !== null && (Number.isNaN(input.latitude) || input.latitude < -90 || input.latitude > 90)) ||
    (input.longitude !== null && (Number.isNaN(input.longitude) || input.longitude < -180 || input.longitude > 180))
  ) {
    errors.coordinates = 'Coordinates must be valid latitude (-90 to 90) and longitude (-180 to 180).';
  }

  return errors;
}

export function validateImageFiles(files: File[]): string | null {
  if (files.length > MAX_IMAGE_FILES) {
    return `You can upload up to ${MAX_IMAGE_FILES} photographs per complaint.`;
  }
  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `Unsupported file type "${file.name}". Please upload JPEG, PNG, or WebP photographs.`;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return `File "${file.name}" exceeds the 5 MB limit.`;
    }
  }
  return null;
}

export function generateComplaintId(ward: ComplaintWard): string {
  const year = new Date().getFullYear();
  const wardCode = ward.replace(/\s+/g, '').replace('Ward', 'W').toUpperCase();
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  const timeSuffix = Date.now().toString(36).slice(-4).toUpperCase();
  return `AQ-${year}-${wardCode}-${timeSuffix}${randomPart}`;
}
