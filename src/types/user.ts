export type UserRole = 'citizen' | 'engineer' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  mobile: string;
  email: string;
  role: UserRole;
  locality: string;
  createdAt: unknown;
}
