import { ExtractedOpportunityData } from "./types";
import { OpportunityType } from "@/types/database";

const validTypes: OpportunityType[] = [
  "internship",
  "job",
  "hackathon",
  "competition",
  "scholarship",
  "workshop",
  "other",
];

const validWorkModes = ["On-site", "Remote", "Hybrid"] as const;

/**
 * Validates and sanitizes structured extraction output
 */
export function validateExtractedOpportunity(
  input: unknown
): { valid: boolean; data?: ExtractedOpportunityData; error?: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { valid: false, error: "Extraction result must be a JSON object" };
  }

  const raw = input as Record<string, any>;

  // Clean and sanitize each field
  const cleanString = (val: any): string | null => {
    if (typeof val !== "string") return null;
    const trimmed = val.trim();
    if (trimmed.length === 0 || trimmed.toLowerCase() === "null" || trimmed.toLowerCase() === "unknown" || trimmed.toLowerCase() === "n/a") {
      return null;
    }
    return trimmed;
  };

  // Validate type
  let type: OpportunityType | null = null;
  const rawType = cleanString(raw.type)?.toLowerCase();
  if (rawType && validTypes.includes(rawType as OpportunityType)) {
    type = rawType as OpportunityType;
  } else if (rawType) {
    if (rawType.includes("intern")) type = "internship";
    else if (rawType.includes("job") || rawType.includes("full-time") || rawType.includes("full time")) type = "job";
    else if (rawType.includes("hack") || rawType.includes("contest")) type = "hackathon";
    else if (rawType.includes("scholar")) type = "scholarship";
    else if (rawType.includes("workshop") || rawType.includes("bootcamp")) type = "workshop";
    else type = "other";
  }

  // Validate work mode
  let work_mode: "On-site" | "Remote" | "Hybrid" | null = null;
  const rawWorkMode = cleanString(raw.work_mode);
  if (rawWorkMode) {
    const matched = validWorkModes.find(
      (m) => m.toLowerCase() === rawWorkMode.toLowerCase()
    );
    if (matched) work_mode = matched;
  }

  // Validate year
  let year: number | null = null;
  if (typeof raw.year === "number" && raw.year >= 1 && raw.year <= 4) {
    year = raw.year;
  } else if (typeof raw.year === "string") {
    const parsedYear = parseInt(raw.year, 10);
    if (!isNaN(parsedYear) && parsedYear >= 1 && parsedYear <= 4) {
      year = parsedYear;
    }
  }

  // Validate skills
  let skills: string[] | null = null;
  if (Array.isArray(raw.skills)) {
    const filtered = raw.skills
      .map((s: any) => (typeof s === "string" ? s.trim() : ""))
      .filter((s: string) => s.length > 0);
    if (filtered.length > 0) skills = filtered;
  } else if (typeof raw.skills === "string") {
    const split = raw.skills
      .split(",")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
    if (split.length > 0) skills = split;
  }

  // Validate URL: Must start with http:// or https://
  let application_url: string | null = cleanString(raw.application_url);
  if (application_url && !application_url.startsWith("http://") && !application_url.startsWith("https://")) {
    // If it looks like a domain name (e.g. xyz.com/apply), prepend https://
    if (application_url.includes(".") && !application_url.includes(" ")) {
      application_url = `https://${application_url}`;
    } else {
      application_url = null; // Don't accept invalid non-URL text
    }
  }

  // Validate deadline
  let deadline: string | null = cleanString(raw.deadline);
  if (deadline) {
    const d = new Date(deadline);
    if (isNaN(d.getTime())) {
      deadline = null; // Reject unparseable deadline
    } else {
      // Standardize to YYYY-MM-DD
      deadline = d.toISOString().split("T")[0];
    }
  }

  const structured: ExtractedOpportunityData = {
    title: cleanString(raw.title),
    company: cleanString(raw.company),
    type,
    description: cleanString(raw.description),
    eligibility: cleanString(raw.eligibility),
    department: cleanString(raw.department),
    year,
    skills,
    stipend: cleanString(raw.stipend),
    package: cleanString(raw.package),
    location: cleanString(raw.location),
    work_mode,
    deadline,
    application_url,
  };

  return { valid: true, data: structured };
}
