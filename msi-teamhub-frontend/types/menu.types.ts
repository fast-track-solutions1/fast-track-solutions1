// types/menu.types.ts
import { LucideIcon } from 'lucide-react';

export type UserRole = 
  | 'employee' 
  | 'team_lead' 
  | 'hr_manager' 
  | 'it_manager' 
  | 'director' 
  | 'admin';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon | null;
  href?: string;
  badge?: number | string;
  badgeColor?: 'red' | 'orange' | 'blue' | 'green';
  roles: UserRole[];
  submenu?: MenuItem[];
  divider?: boolean;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  photo?: string;
  role: UserRole;
  permissions: string[];
  service?: number;
  department?: number;
}
