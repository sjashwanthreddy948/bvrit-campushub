import { Profile, UserRole } from "./database";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  profile?: Profile | null;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  departmentId?: string;
  year?: number;
  section?: string;
  cgpa?: number | null;
  skills?: { skill_name: string; skill_category: import("./database").SkillCategory }[];
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  redirectUrl?: string;
  user?: AuthUser;
}
