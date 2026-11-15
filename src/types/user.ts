export type UserRole = 'citizen' | 'engineer' | 'admin';

export type LoginPortal = 'resident' | 'engineer' | 'pdo';

export interface UserProfile {
  uid: string;
  name: string;
  mobile: string;
  email: string;
  role: UserRole;
  locality: string;
  createdAt: unknown;
}

export interface RoleMarkerRecord {
  uid: string;
  email: string;
  assignedAt: unknown;
  roleType: 'engineer' | 'admin';
}
