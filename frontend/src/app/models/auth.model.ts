export type UserRole = 'owner' | 'manager' | 'employee';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  jobTitle?: string;
  avatarUrl?: string;
  canEditPrice?: boolean;
}

export interface EmployeeAccount {
  id: string;
  name: string;
  phone: string;
  password: string;
  jobTitle: string;
  canEditPrice?: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
