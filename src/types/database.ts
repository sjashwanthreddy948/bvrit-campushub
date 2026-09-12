export type UserRole = "student" | "faculty" | "admin" | "coordinator" | "hod";

export type OpportunityType = 
  | "internship" 
  | "job" 
  | "hackathon" 
  | "competition" 
  | "scholarship" 
  | "workshop" 
  | "other";

export type ApplicationStatus = 
  | "saved"
  | "planning"
  | "applied" 
  | "assessment" 
  | "interview" 
  | "selected" 
  | "rejected"
  | "not_interested"
  | "closed";

export type SkillCategory =
  | "Programming Language"
  | "Frontend"
  | "Backend"
  | "Database"
  | "Cloud"
  | "AI/ML"
  | "Tools"
  | "Other";

export interface StudentSkill {
  id: string;
  student_id: string;
  skill_name: string;
  skill_category: SkillCategory;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  department_id?: string | null;
  department?: Department | null;
  year?: number | null;
  section?: string | null;
  current_cgpa?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  description: string;
  type: OpportunityType;
  eligibility: string;
  skills: string[];
  eligible_departments?: string[];
  eligible_years?: number[];
  min_cgpa?: number | null;
  required_skills?: string[];
  preferred_skills?: string[];
  stipend?: string | null;
  package?: string | null;
  location: string;
  work_mode: string;
  deadline: string;
  application_url: string;
  posted_by?: string | null;
  department?: string | null;
  year?: number | null;
  section?: string | null;
  created_at: string;
  updated_at: string;
  creator?: Profile | null;
}

export interface SavedOpportunity {
  id: string;
  student_id: string;
  opportunity_id: string;
  created_at: string;
  opportunity?: Opportunity | null;
}

export interface Application {
  id: string;
  student_id: string;
  opportunity_id: string;
  status: ApplicationStatus;
  applied_at: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  opportunity?: Opportunity | null;
}

export interface Circular {
  id: string;
  title: string;
  description: string;
  attachment_url?: string | null;
  department_id?: string | null;
  department?: Department | null;
  year?: number | null;
  section?: string | null;
  deadline?: string | null;
  posted_by?: string | null;
  created_at: string;
  updated_at: string;
  creator?: Profile | null;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  department_id: string;
  department?: Department | null;
  year: number;
  section: string;
  deadline: string;
  submission_url: string;
  posted_by: string;
  created_at: string;
  updated_at: string;
  faculty?: Profile | null;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      departments: {
        Row: Department;
        Insert: Omit<Department, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<Department, "id">>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at" | "department"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, "id">>;
      };
      opportunities: {
        Row: Opportunity;
        Insert: Omit<Opportunity, "id" | "created_at" | "updated_at" | "creator"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Opportunity, "id">>;
      };
      saved_opportunities: {
        Row: SavedOpportunity;
        Insert: Omit<SavedOpportunity, "id" | "created_at" | "opportunity"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<SavedOpportunity, "id">>;
      };
      applications: {
        Row: Application;
        Insert: Omit<Application, "id" | "applied_at" | "created_at" | "updated_at" | "opportunity"> & {
          id?: string;
          applied_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Application, "id">>;
      };
      circulars: {
        Row: Circular;
        Insert: Omit<Circular, "id" | "created_at" | "updated_at" | "department" | "creator"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Circular, "id">>;
      };
      assignments: {
        Row: Assignment;
        Insert: Omit<Assignment, "id" | "created_at" | "updated_at" | "department" | "faculty"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Assignment, "id">>;
      };
      notifications: {
        Row: NotificationItem;
        Insert: Omit<NotificationItem, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<NotificationItem, "id">>;
      };
      student_application_profiles: {
        Row: import("../lib/profile/types").StudentApplicationProfile;
        Insert: Partial<import("../lib/profile/types").StudentApplicationProfile> & {
          student_id: string;
        };
        Update: Partial<import("../lib/profile/types").StudentApplicationProfile>;
      };
      student_skills: {
        Row: StudentSkill;
        Insert: Omit<StudentSkill, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<StudentSkill, "id" | "student_id" | "created_at">>;
      };
    };
  };
};

