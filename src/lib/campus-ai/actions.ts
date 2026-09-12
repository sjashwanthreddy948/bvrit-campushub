"use server";

import { getCurrentSessionUser } from "@/lib/auth/actions";
import { UserRole } from "@/types/database";
import { queryCampusAi, CampusAiAnswer } from "./engine";
import {
  BVRIT_INSTITUTION_PROFILE,
  BVRIT_QUICK_CATEGORIES,
  BVRIT_DEPARTMENTS,
  BVRIT_KEY_CONTACTS,
} from "./knowledge";

export interface AskCampusAiResponse extends CampusAiAnswer {
  success: boolean;
  error?: string;
}

// ─── Gemini Reasoning Helper ──────────────────────────────────────────────────

const CAMPUS_AI_SYSTEM_PROMPT = `You are CampusHub AI — the advanced reasoning and campus intelligence system for B.V. Raju Institute of Technology (BVRIT), Narsapur, Telangana, created by Vishnu Universal Learning.

You operate with the depth, clarity, and precision of ChatGPT.

Core Directives:
1. ACCURACY & THINKING: Analyze every question step-by-step. For mathematics (e.g., 5 + 5 = 10, algebra, calculus, discrete math), ALWAYS compute accurately and show your reasoning clearly. Never produce random or boilerplate text.
2. CODING & ALGORITHMS: When asked to write code (Python, Java, C++, TypeScript, SQL), output clean, production-ready, well-commented code with complexity analysis.
3. GENERAL KNOWLEDGE: Answer any general academic, scientific, career, writing, or interview question with full authority and structured formatting.
4. BVRIT INSTITUTIONAL CONTEXT:
   - Full Name: B.V. Raju Institute of Technology (BVRIT), Narsapur, Medak District, Telangana (Est. 1997).
   - Parent Organization: Sri Vishnu Educational Society (SVES) / Vishnu Universal Learning.
   - Status: UGC Autonomous Institution, NAAC 'A+' Grade accredited, NBA Tier-I programs, affiliated to JNTU Hyderabad.
   - Leadership: Chairman Sri K.V. Vishnu Raju; Vice Chairman Sri Ravichandran Rajagopal; Principal Dr. Sanjay Dubey.
   - Placements: 1,540+ offers, ₹44.14 LPA highest package (Tier-1 companies like Amazon, Microsoft, TCS, Infosys, Cognizant, Wipro).
   - Academics: 11 B.Tech programs (CSE, IT, AIML, AIDS, ECE, EEE, ME, CE, CHE, BME, PHE), 27 sections tracked, Vedic.ai for assignments & attendance.
   - Facilities: Dr. APJ Abdul Kalam Block, Atal Incubation Centre (AIC-BVRIT), 60+ GPS-tracked bus routes across Hyderabad & Medak.

Format Guidelines:
- Highlight key facts and numbers using **bold**.
- Use bullet points and numbered lists for steps.
- Use fenced code blocks with language tags for code snippets.
- Be concise for simple questions (e.g. "5+5 = 10"), and detailed for comprehensive questions.`;

async function callGeminiForCampusAi(
  question: string,
  effectiveRole: UserRole,
  userContext?: any
): Promise<CampusAiAnswer | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length < 10) return null;

  const models = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.5-flash-lite"];

  const userPrompt = userContext?.department
    ? `[User Context: Role=${effectiveRole}, Dept=${userContext.department}, Year=${userContext.year || "All"}]\n${question}`
    : question;

  for (const modelName of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey.trim(),
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: CAMPUS_AI_SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
            topP: 0.95,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          // Derive helpful follow-ups based on query
          const followUps = [
            "Explain this step-by-step",
            "Give me a real-world code example",
            "What are BVRIT placement opportunities?",
          ];
          return {
            answer: text.trim(),
            category: "CampusHub Intelligence",
            sourceTopics: ["Gemini Reasoning Model", "BVRIT Knowledge Base"],
            suggestedFollowUps: followUps,
          };
        }
      }
    } catch (e) {
      console.warn(`Gemini call to ${modelName} in askCampusAi failed:`, e);
    }
  }
  return null;
}

/**
 * Server action to query the CampusHub AI regarding BVRIT Narsapur
 */
export async function askCampusAi(
  question: string,
  userRoleOverride?: UserRole
): Promise<AskCampusAiResponse> {
  try {
    const sessionUser = await getCurrentSessionUser();
    const effectiveRole: UserRole = userRoleOverride || sessionUser?.role || "student";

    const userContext = {
      department:
        typeof sessionUser?.profile?.department === "string"
          ? sessionUser.profile.department
          : (sessionUser?.profile?.department as any)?.code || (sessionUser?.profile?.department as any)?.name,
      year: sessionUser?.profile?.year ?? undefined,
      section: sessionUser?.profile?.section ?? undefined,
    };

    // 1. Try Gemini Reasoning Engine first for accurate, ChatGPT-level answers
    const geminiAnswer = await callGeminiForCampusAi(question, effectiveRole, userContext);
    if (geminiAnswer) {
      return {
        success: true,
        ...geminiAnswer,
      };
    }

    // 2. Fall back to deterministic institutional knowledge engine
    const result = await queryCampusAi(question, effectiveRole, userContext);
    return {
      success: true,
      ...result,
    };
  } catch (err: any) {
    console.error("Error running Campus AI query:", err);
    return {
      success: false,
      answer: "We encountered an issue processing your question. Please try again shortly.",
      category: "Error",
      sourceTopics: [],
      suggestedFollowUps: [
        "Tell me about BVRIT placements",
        "Show college bus routes",
        "Who is the Principal?",
      ],
      error: err?.message || "Internal server error",
    };
  }
}

/**
 * Get category metadata for exploration cards
 */
export async function getCampusQuickCategories() {
  return BVRIT_QUICK_CATEGORIES;
}

/**
 * Get institutional overview details
 */
export async function getCampusInstitutionProfile() {
  return BVRIT_INSTITUTION_PROFILE;
}

/**
 * Get list of departments for quick lookup
 */
export async function getCampusDepartmentsList() {
  return BVRIT_DEPARTMENTS.map((d) => ({
    code: d.code,
    name: d.name,
    degree: d.degree,
    hod: d.hod,
    intake: d.intake,
  }));
}

/**
 * Get emergency numbers
 */
export async function getCampusEmergencyContacts() {
  return BVRIT_KEY_CONTACTS.filter(
    (c) =>
      c.designation.includes("Ambulance") ||
      c.designation.includes("Anti-Ragging") ||
      c.designation.includes("Women") ||
      c.designation.includes("Principal")
  );
}
