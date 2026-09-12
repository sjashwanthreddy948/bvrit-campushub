import { OpportunityType } from "@/types/database";

export interface ExtractedOpportunityData {
  title: string | null;
  company: string | null;
  type: OpportunityType | null;
  description: string | null;
  eligibility: string | null;
  department: string | null;
  year: number | null;
  skills: string[] | null;
  stipend: string | null;
  package: string | null;
  location: string | null;
  work_mode: "On-site" | "Remote" | "Hybrid" | null;
  deadline: string | null; // ISO string or YYYY-MM-DD
  application_url: string | null;
}

export interface ExtractionResult {
  success: boolean;
  data?: ExtractedOpportunityData;
  error?: string;
  sourceText?: string;
  isFallback?: boolean;
}
