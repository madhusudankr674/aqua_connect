import type { ComplaintStatus } from '../types/complaint';

export const COMPLAINT_STATUS_ORDER: ComplaintStatus[] = [
  'Submitted',
  'Acknowledged',
  'In Progress',
  'Referred for Laboratory Testing',
  'Resolved',
  'Closed',
];

export const ALLOWED_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  Submitted: ['Acknowledged', 'In Progress', 'Referred for Laboratory Testing'],
  Acknowledged: ['In Progress', 'Referred for Laboratory Testing', 'Resolved'],
  'In Progress': ['Referred for Laboratory Testing', 'Resolved'],
  'Referred for Laboratory Testing': ['In Progress', 'Resolved'],
  Resolved: ['Closed'],
  Closed: [],
};

export function canTransitionStatus(
  current: ComplaintStatus,
  next: ComplaintStatus,
  isAdmin = false
): boolean {
  if (current === next) return true;
  if (current === 'Closed' && !isAdmin) return false;
  return ALLOWED_TRANSITIONS[current].includes(next);
}

export function getAllowedNextStatuses(
  current: ComplaintStatus,
  isAdmin = false
): ComplaintStatus[] {
  if (current === 'Closed' && isAdmin) {
    return ['Closed'];
  }
  return [current, ...ALLOWED_TRANSITIONS[current]];
}

export interface StatusStyleMeta {
  textColor: string;
  bgColor: string;
  borderColor: string;
  pinBg: string;
  pinBorder: string;
}

export function getStatusStyle(status: ComplaintStatus): StatusStyleMeta {
  switch (status) {
    case 'Submitted':
      return {
        textColor: 'text-sky-900',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-200',
        pinBg: '#0284c7',
        pinBorder: '#075985',
      };
    case 'Acknowledged':
      return {
        textColor: 'text-indigo-900',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        pinBg: '#4f46e5',
        pinBorder: '#312e81',
      };
    case 'In Progress':
      return {
        textColor: 'text-amber-900',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        pinBg: '#d97706',
        pinBorder: '#92400e',
      };
    case 'Referred for Laboratory Testing':
      return {
        textColor: 'text-rose-900',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
        pinBg: '#e11d48',
        pinBorder: '#881337',
      };
    case 'Resolved':
      return {
        textColor: 'text-emerald-900',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        pinBg: '#16a34a',
        pinBorder: '#14532d',
      };
    case 'Closed':
      return {
        textColor: 'text-slate-700',
        bgColor: 'bg-slate-100',
        borderColor: 'border-slate-300',
        pinBg: '#475569',
        pinBorder: '#1e293b',
      };
  }
}
