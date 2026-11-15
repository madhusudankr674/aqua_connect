export type ComplaintWard =
  | 'Ward 1'
  | 'Ward 2'
  | 'Ward 3'
  | 'Ward 4'
  | 'Ward 5'
  | 'Other';

export type ComplaintCategory =
  | 'Muddy or cloudy water'
  | 'Unusual colour'
  | 'Unusual smell'
  | 'Unusual taste'
  | 'Visible particles'
  | 'Pipeline leakage'
  | 'Irregular water supply'
  | 'Low water pressure'
  | 'Other';

export type ComplaintStatus =
  | 'Submitted'
  | 'Acknowledged'
  | 'In Progress'
  | 'Referred for Laboratory Testing'
  | 'Resolved'
  | 'Closed';

export interface Complaint {
  complaintId: string;
  citizenId: string;
  citizenName: string;
  mobile: string;
  ward: ComplaintWard;
  locality: string;
  category: ComplaintCategory;
  description: string;
  latitude: number | null;
  longitude: number | null;
  landmark: string;
  imageUrls: string[];
  observationDate: string;
  continuingIssue: boolean;
  status: ComplaintStatus;
  assignedEngineer: string;
  engineerRemarks: string;
  correctiveAction: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface ComplaintHistoryEntry {
  historyId: string;
  complaintId: string;
  previousStatus: ComplaintStatus | 'None';
  newStatus: ComplaintStatus;
  remarks: string;
  updatedBy: string;
  updatedByUid: string;
  timestamp: unknown;
}

export interface PublicTimelineItem {
  status: ComplaintStatus;
  remarks: string;
  updatedBy: string;
  timestampIso: string;
}

export interface PublicTrackingRecord {
  complaintId: string;
  ward: ComplaintWard;
  locality: string;
  landmark: string;
  category: ComplaintCategory;
  observationDate: string;
  continuingIssue: boolean;
  status: ComplaintStatus;
  assignedEngineer: string;
  engineerRemarks: string;
  correctiveAction: string;
  verificationLast4: string;
  timeline: PublicTimelineItem[];
  createdAt: unknown;
  updatedAt: unknown;
}

export interface ComplaintFormInput {
  citizenName: string;
  mobile: string;
  ward: ComplaintWard;
  locality: string;
  category: ComplaintCategory;
  description: string;
  latitude: number | null;
  longitude: number | null;
  landmark: string;
  observationDate: string;
  continuingIssue: boolean;
}
