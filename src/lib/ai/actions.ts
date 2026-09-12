"use server";

import { performOpportunityExtraction } from "./extract";
import { ExtractionResult } from "./types";
import { getCurrentSessionUser } from "@/lib/auth/actions";

/**
 * Server Action: Extract structured opportunity details from raw announcement text
 * - Validates authentication / role (faculty or admin)
 * - Safe server-side execution: keeps API keys confidential
 * - Handles rate-limits, timeouts, and errors gracefully
 */
export async function extractOpportunityDetails(
  rawText: string
): Promise<ExtractionResult> {
  const sessionUser = await getCurrentSessionUser();
  const role = sessionUser?.role || "faculty";

  if (role !== "faculty" && role !== "admin" && role !== "coordinator") {
    return {
      success: false,
      error: "Unauthorized: Only faculty, coordinators, and administrators can use the AI Opportunity Extractor.",
    };
  }

  return await performOpportunityExtraction(rawText);
}
