export interface StudentApplicationProfile {
  id?: string;
  student_id: string;

  // Personal Information
  full_name: string;
  college_roll_number: string;
  personal_email: string;
  college_email: string;
  phone: string;

  // Academic Information
  college_name: string;
  degree: string;
  department: string;
  current_year: number;
  graduation_year: number;
  cgpa: number | null;

  // Career Information
  programming_languages: string[];
  technical_skills: string[];
  preferred_roles: string[];
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;

  // Documents
  resume_url?: string | null;
  resume_file_name?: string | null;
  resume_file_size?: number | null;
  resume_updated_at?: string | null;

  created_at?: string;
  updated_at?: string;
}

export interface ProfileCompleteness {
  percentage: number;
  completedCount: number;
  totalCount: number;
  missingFields: {
    key: keyof StudentApplicationProfile;
    label: string;
    section: "personal" | "academic" | "career" | "resume";
    importance: "critical" | "recommended";
  }[];
  isComplete: boolean;
}

export interface ChecklistItem {
  key: string;
  label: string;
  status: "ready" | "warning" | "missing";
  message: string;
  isRequired: boolean;
  valuePreview?: string;
}

export interface QuickCopyItem {
  key: string;
  label: string;
  value: string;
  type: "text" | "email" | "phone" | "url";
}

export interface AIAlignmentBrief {
  relevantProfileSummary: string;
  matchingSkills: string[];
  missingSkills: string[];
  deadlineNotice: string;
  guidanceNotes: string[];
}

export interface ApplicationPreparationData {
  opportunityId: string;
  opportunityTitle: string;
  company: string;
  applicationUrl: string;
  deadline?: string;
  profileCompleteness: ProfileCompleteness;
  checklist: ChecklistItem[];
  quickCopyItems: QuickCopyItem[];
  hasResume: boolean;
  resumeFileName?: string | null;
  resumeUrl?: string | null;
  aiBrief: AIAlignmentBrief;
}
