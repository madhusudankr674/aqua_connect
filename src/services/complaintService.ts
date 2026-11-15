import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../config/firebase';
import type {
  Complaint,
  ComplaintFormInput,
  ComplaintHistoryEntry,
  ComplaintStatus,
  PublicTimelineItem,
  PublicTrackingRecord,
} from '../types/complaint';
import { extractMobileLast4, generateComplaintId, sanitizeMobile } from './validation';
import { canTransitionStatus } from './workflow';

export async function submitComplaint(params: {
  citizenUid: string;
  input: ComplaintFormInput;
  imageUrls: string[];
}): Promise<Complaint> {
  const { citizenUid, input, imageUrls } = params;
  const complaintId = generateComplaintId(input.ward);
  const historyId = `HIST-${complaintId}-1`;
  const nowIso = new Date().toISOString();
  const cleanMobile = sanitizeMobile(input.mobile);
  const verificationLast4 = extractMobileLast4(cleanMobile);

  const complaintDoc: Complaint = {
    complaintId,
    citizenId: citizenUid,
    citizenName: input.citizenName.trim().slice(0, 100),
    mobile: cleanMobile,
    ward: input.ward,
    locality: input.locality.trim().slice(0, 120),
    category: input.category,
    description: input.description.trim().slice(0, 2000),
    latitude: input.latitude,
    longitude: input.longitude,
    landmark: input.landmark.trim().slice(0, 200),
    imageUrls: imageUrls.slice(0, 3),
    observationDate: input.observationDate.trim().slice(0, 40),
    continuingIssue: Boolean(input.continuingIssue),
    status: 'Submitted',
    assignedEngineer: '',
    engineerRemarks: '',
    correctiveAction: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const initialTimelineItem: PublicTimelineItem = {
    status: 'Submitted',
    remarks: 'Complaint registered by citizen via Aqua Connect portal.',
    updatedBy: 'Citizen Portal',
    timestampIso: nowIso,
  };

  const publicDoc: PublicTrackingRecord = {
    complaintId,
    ward: input.ward,
    locality: complaintDoc.locality,
    landmark: complaintDoc.landmark,
    category: input.category,
    observationDate: complaintDoc.observationDate,
    continuingIssue: complaintDoc.continuingIssue,
    status: 'Submitted',
    assignedEngineer: '',
    engineerRemarks: '',
    correctiveAction: '',
    verificationLast4,
    timeline: [initialTimelineItem],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const historyDoc: ComplaintHistoryEntry = {
    historyId,
    complaintId,
    previousStatus: 'None',
    newStatus: 'Submitted',
    remarks: 'Citizen water observation submitted.',
    updatedBy: complaintDoc.citizenName,
    updatedByUid: citizenUid,
    timestamp: serverTimestamp(),
  };

  const batch = writeBatch(db);
  batch.set(doc(db, 'complaints', complaintId), complaintDoc);
  batch.set(doc(db, 'public_complaint_tracking', complaintId), publicDoc);
  batch.set(doc(db, 'complaint_history', historyId), historyDoc);

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `complaints/${complaintId}`);
  }

  return complaintDoc;
}

export async function lookupPublicComplaint(
  complaintId: string,
  mobileLast4: string
): Promise<PublicTrackingRecord | null> {
  const trimmedId = complaintId.trim().toUpperCase();
  const trimmedLast4 = mobileLast4.replace(/\D/g, '').slice(-4);

  if (!/^[a-zA-Z0-9_-]{5,64}$/.test(trimmedId) || trimmedLast4.length !== 4) {
    throw new Error('Enter a valid Complaint ID and the last 4 digits of the registered mobile number.');
  }

  const path = `public_complaint_tracking/${trimmedId}`;
  try {
    const snap = await getDoc(doc(db, 'public_complaint_tracking', trimmedId));
    if (!snap.exists()) {
      return null;
    }
    const record = snap.data() as PublicTrackingRecord;
    if (record.verificationLast4 !== trimmedLast4) {
      throw new Error('Verification failed. The mobile digits do not match this Complaint ID.');
    }
    return record;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Verification failed')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function fetchCitizenComplaints(citizenUid: string): Promise<Complaint[]> {
  const path = 'complaints';
  try {
    const q = query(
      collection(db, 'complaints'),
      where('citizenId', '==', citizenUid),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Complaint);
  } catch (error) {
    // Fallback without composite index if needed
    try {
      const qSimple = query(
        collection(db, 'complaints'),
        where('citizenId', '==', citizenUid)
      );
      const snap = await getDocs(qSimple);
      return snap.docs.map((d) => d.data() as Complaint);
    } catch (innerError) {
      handleFirestoreError(innerError, OperationType.LIST, path);
    }
  }
}

export function subscribeAllComplaints(
  onData: (complaints: Complaint[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const path = 'complaints';
  const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => d.data() as Complaint));
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function fetchComplaintHistory(
  complaintId: string
): Promise<ComplaintHistoryEntry[]> {
  const path = 'complaint_history';
  try {
    const q = query(
      collection(db, 'complaint_history'),
      where('complaintId', '==', complaintId)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => d.data() as ComplaintHistoryEntry);
    return list.sort((a, b) => {
      const ta = toMillis(a.timestamp);
      const tb = toMillis(b.timestamp);
      return ta - tb;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateComplaintByEngineer(params: {
  complaint: Complaint;
  nextStatus: ComplaintStatus;
  assignedEngineer: string;
  engineerRemarks: string;
  correctiveAction: string;
  historyNote: string;
  engineerName: string;
  engineerUid: string;
  isAdmin: boolean;
}): Promise<void> {
  const {
    complaint,
    nextStatus,
    assignedEngineer,
    engineerRemarks,
    correctiveAction,
    historyNote,
    engineerName,
    engineerUid,
    isAdmin,
  } = params;

  if (!canTransitionStatus(complaint.status, nextStatus, isAdmin)) {
    throw new Error(
      `Invalid status transition from "${complaint.status}" to "${nextStatus}".`
    );
  }

  const complaintRef = doc(db, 'complaints', complaint.complaintId);
  const publicRef = doc(db, 'public_complaint_tracking', complaint.complaintId);
  const historyId = `HIST-${complaint.complaintId}-${Date.now()}`;
  const historyRef = doc(db, 'complaint_history', historyId);

  let existingTimeline: PublicTimelineItem[] = [];
  try {
    const publicSnap = await getDoc(publicRef);
    if (publicSnap.exists()) {
      existingTimeline = (publicSnap.data() as PublicTrackingRecord).timeline || [];
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `public_complaint_tracking/${complaint.complaintId}`);
  }

  const cleanRemarks = engineerRemarks.trim().slice(0, 2000);
  const cleanAction = correctiveAction.trim().slice(0, 2000);
  const cleanAssigned = assignedEngineer.trim().slice(0, 100);
  const cleanNote = (historyNote.trim() || cleanRemarks || `Status updated to ${nextStatus}`).slice(0, 1000);

  const nextTimelineItem: PublicTimelineItem = {
    status: nextStatus,
    remarks: cleanNote,
    updatedBy: engineerName.slice(0, 100),
    timestampIso: new Date().toISOString(),
  };

  const nextTimeline = [...existingTimeline, nextTimelineItem].slice(-25);

  const batch = writeBatch(db);
  batch.update(complaintRef, {
    status: nextStatus,
    assignedEngineer: cleanAssigned,
    engineerRemarks: cleanRemarks,
    correctiveAction: cleanAction,
    updatedAt: serverTimestamp(),
  });

  batch.update(publicRef, {
    status: nextStatus,
    assignedEngineer: cleanAssigned,
    engineerRemarks: cleanRemarks,
    correctiveAction: cleanAction,
    timeline: nextTimeline,
    updatedAt: serverTimestamp(),
  });

  batch.set(historyRef, {
    historyId,
    complaintId: complaint.complaintId,
    previousStatus: complaint.status,
    newStatus: nextStatus,
    remarks: cleanNote,
    updatedBy: engineerName.slice(0, 100),
    updatedByUid: engineerUid,
    timestamp: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `complaints/${complaint.complaintId}`);
  }
}

export function toMillis(ts: unknown): number {
  if (!ts) return 0;
  if (typeof ts === 'object' && ts !== null && 'toMillis' in ts) {
    return (ts as { toMillis: () => number }).toMillis();
  }
  if (typeof ts === 'object' && ts !== null && 'seconds' in ts) {
    return (ts as { seconds: number }).seconds * 1000;
  }
  if (typeof ts === 'string') {
    const parsed = Date.parse(ts);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export function formatTimestamp(ts: unknown): string {
  const ms = toMillis(ts);
  if (!ms) return 'Just now';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(ms));
}
