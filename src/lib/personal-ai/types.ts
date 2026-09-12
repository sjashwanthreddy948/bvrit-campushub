/**
 * CampusHub AI — Hybrid Intelligence Guide Types
 * Supports Type A (CampusHub Data), Type B (Personalized Guidance), Type C (General Knowledge)
 */

import { Opportunity } from "@/types/database";

export type QueryClassification =
  | "type_a_campushub"
  | "type_b_guidance"
  | "type_c_general";

export type PersonalAiIntent =
  // Type A: CampusHub Data Questions
  | "tomorrow"
  | "upcoming_deadlines"
  | "opportunity_matching"
  | "summarize_item"
  | "application_status"
  | "eligibility_check"
  // Type B: Personalized Guidance Questions
  | "skill_gaps"
  | "improvement_steps"
  | "next_skill"
  | "placement_prep"
  | "resume_advice"
  | "interview_prep"
  | "tech_choice"
  // Type C: General Knowledge & Programming
  | "programming_help"
  | "algorithm_explanation"
  | "concept_explanation"
  | "code_debugging"
  | "professional_writing"
  | "general_ai"
  // Legacy / fallback
  | "general_query";

export interface StudentPersonalContext {
  studentId: string;
  fullName: string;
  department: string;
  year: number;
  section: string;
  cgpa: number | null;
  skills: string[];
  savedOpportunities: Array<{
    id: string;
    title: string;
    company: string;
    deadline: string;
    isApplied: boolean;
    daysRemaining: number;
  }>;
  appliedOpportunities: Array<{
    id: string;
    title: string;
    company: string;
    status: string;
    appliedAt: string;
  }>;
  assignments: Array<{
    id: string;
    title: string;
    subject: string;
    deadline: string;
    submissionUrl?: string;
    daysRemaining: number;
  }>;
  circulars: Array<{
    id: string;
    circular_no: string;
    title: string;
    description: string;
    deadline: string | null;
    published_date: string;
    daysRemaining?: number | null;
  }>;
  activeOpportunities: Opportunity[];
}

export interface PersonalAiResponse {
  intent: PersonalAiIntent;
  queryType?: QueryClassification;
  title: string;
  answer: string;
  suggestedQuestions: string[];
  category: string;
  contextSources?: string[];
  relevantLinks?: Array<{
    label: string;
    href: string;
    isExternal?: boolean;
  }>;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  intent?: PersonalAiIntent;
  queryType?: QueryClassification;
  suggestedQuestions?: string[];
  contextSources?: string[];
  isError?: boolean;
}
