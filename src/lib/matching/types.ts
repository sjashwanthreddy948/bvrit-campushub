/**
 * AI Opportunity Matching Types & Contracts
 */

export type MatchCategory =
  | "Strong Match"
  | "Good Match"
  | "Partial Match"
  | "Requirements Not Fully Matched"
  | "Unable to Determine";

export interface StudentMatchingProfile {
  department: string;
  year: number;
  skills: string[];
  cgpa?: number | null;
  preferredRoles?: string[];
  preferredLocations?: string[];
  preferredWorkMode?: "On-site" | "Remote" | "Hybrid" | "Any" | null;
}

export interface OpportunityMatchingCriteria {
  id: string;
  title: string;
  company: string;
  type: string;
  department?: string | null;
  year?: number | null;
  skills: string[];
  eligibility: string;
  location: string;
  work_mode: string;
  eligible_departments?: string[];
  eligible_years?: number[];
  min_cgpa?: number | null;
  required_skills?: string[];
  preferred_skills?: string[];
}

export interface MatchingResult {
  matchCategory: MatchCategory;
  matchScore: number; // Deterministic composite 0 - 100
  matchingSkills: string[];
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];
  satisfiedRequirements: string[];
  unsatisfiedRequirements: string[];
  missingInfoRequirements: string[];
  aiExplanation: string;
  disclaimer: string;

  // Compatibility fields
  isEligible?: boolean;
  status?: string;
  strongMatches?: string[];
  potentialGaps?: string[];
  eligibilityExplanation?: string;
}
