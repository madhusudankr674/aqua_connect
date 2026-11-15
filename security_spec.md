# Aqua Connect Security Specification

## 1. Data Invariants
1. **User Role Integrity**: Every newly registered user profile in `/users/{uid}` is strictly forced to `role == 'citizen'`. Role escalation (`engineer`, `admin`) is impossible from client profile creation or self-update; elevated access is derived solely from `/admins/{uid}`, `/engineers/{uid}`, or the verified bootstrapped admin email (`madhusudankr06@gmail.com` with `email_verified == true`).
2. **PII Isolation**: Citizen names, emails, and full mobile numbers in `/users` and `/complaints` are strictly readable only by the owning citizen (`citizenId == request.auth.uid`) or authorized engineers/admins. Public tracking reads only from `/public_complaint_tracking/{complaintId}`, which contains zero citizen names, emails, or full phone numbers, and denies `list` queries completely (`allow list: if false`).
3. **Complaint Workflow Integrity**: Newly created complaints must start with `status == 'Submitted'`, empty `assignedEngineer`/`engineerRemarks`/`correctiveAction`, and `citizenId == request.auth.uid`. Only authorized engineers/admins can transition status or record investigation notes. Once a complaint reaches `'Closed'`, non-admin updates are blocked.
4. **Immutable Audit Trail**: `/complaint_history/{historyId}` documents cannot be updated or deleted once written (`allow update, delete: if false`). Every write requires `timestamp == request.time`.
5. **Atomicity Guarantee**: Creating a complaint requires atomically creating its `/public_complaint_tracking/{complaintId}` projection in the same batch (`existsAfter`).
6. **Temporal Integrity & Path Hardening**: All document IDs are validated against `^[a-zA-Z0-9_\-]+$` (max 128 chars). All `createdAt`, `updatedAt`, and `timestamp` fields are strictly validated against `request.time`. All strings and lists enforce explicit `.size()` bounds.

## 2. The "Dirty Dozen" Adversarial Payloads (Expected: PERMISSION_DENIED)
1. **Self-Assigned Engineer Role**: `setDoc('/users/user123', { uid: 'user123', name: 'Mallory', email: 'm@example.com', role: 'engineer', createdAt: serverTimestamp() })` by non-admin user -> **DENIED**.
2. **Role Escalation via User Update**: `updateDoc('/users/user123', { role: 'admin' })` by citizen -> **DENIED**.
3. **Spoofed Complaint CitizenId**: `setDoc('/complaints/AQ-2026-W2-9999', { ..., citizenId: 'victim_uid', status: 'Submitted' })` by attacker -> **DENIED**.
4. **Status Shortcutting on Create**: `setDoc('/complaints/AQ-2026-W2-9998', { ..., citizenId: auth.uid, status: 'Resolved' })` -> **DENIED**.
5. **Shadow Ghost Field Injection**: `setDoc('/complaints/AQ-2026-W2-9997', { ..., isVerified: true })` -> **DENIED** (`hasOnly` rejects unknown keys).
6. **Citizen Tampering with Engineer Remarks**: `updateDoc('/complaints/AQ-2026-W2-0001', { status: 'Resolved', engineerRemarks: 'Fixed' })` by citizen -> **DENIED**.
7. **Unverified Email Write**: Creating a complaint when `request.auth.token.email_verified == false` -> **DENIED**.
8. **Blanket User List Scraping**: `getDocs(collection(db, 'users'))` by a citizen -> **DENIED**.
9. **Public Tracking Enumeration**: `getDocs(collection(db, 'public_complaint_tracking'))` -> **DENIED** (`allow list: if false`).
10. **Terminal State Tampering**: `updateDoc('/complaints/AQ-CLOSED-1', { status: 'In Progress' })` by non-admin engineer after status is `'Closed'` -> **DENIED**.
11. **History Audit Log Deletion**: `deleteDoc('/complaint_history/hist-1')` by any user -> **DENIED**.
12. **Resource Poisoning (Oversized ID / String)**: `setDoc('/complaints/' + 'a'.repeat(500), ...)` or `description` > 2000 chars -> **DENIED**.
