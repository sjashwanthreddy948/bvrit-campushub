import { ExtractedOpportunityData, ExtractionResult } from "./types";
import { validateExtractedOpportunity } from "./schema";
import { OpportunityType } from "@/types/database";

const SYSTEM_PROMPT = `You are an expert AI data extraction assistant for college placement and opportunity management.
Extract structured fields from the provided unstructured announcement text.

Return ONLY a valid JSON object with EXACTLY these keys:
{
  "title": string or null,
  "company": string or null,
  "type": "internship" | "job" | "hackathon" | "competition" | "scholarship" | "workshop" | "other" | null,
  "description": string or null,
  "eligibility": string or null,
  "department": string or null,
  "year": number (1, 2, 3, or 4) or null,
  "skills": array of strings or null,
  "stipend": string or null,
  "package": string or null,
  "location": string or null,
  "work_mode": "On-site" | "Remote" | "Hybrid" | null,
  "deadline": "YYYY-MM-DD" or null,
  "application_url": string or null
}

STRICT EXTRACTION RULES:
1. NEVER INVENT OR HALLUCINATE ANY INFORMATION.
2. If a field (especially deadline, stipend, package, eligibility, company, application URL, or CGPA) is NOT explicitly mentioned in the text, you MUST set it to null.
3. If no URL is mentioned, set application_url to null.
4. If no deadline date is mentioned, set deadline to null.
5. If no salary/stipend is mentioned, set stipend and package to null.
6. Return purely valid JSON with no conversational text or markdown formatting.`;

/**
 * Intelligent Rule-based Heuristic Extractor
 * Operates offline or as fallback when external LLM APIs are unavailable, timed out, or rate-limited.
 * Strictly avoids hallucinating missing fields.
 */
export function extractHeuristically(rawText: string): ExtractedOpportunityData {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Company extraction
  let company: string | null = null;

  // First, check explicit "Company: ..." line or markup (e.g. WhatsApp *Company: Oracle* or Company: *Oracle*)
  const explicitCompanyMatch = text.match(/(?:company|organization)\s*[:\-*]?\s*\*?([A-Za-z0-9&.\s]{2,30}?)(?:\*|\n|\r|$)/i);
  if (explicitCompanyMatch && explicitCompanyMatch[1]) {
    const cand = explicitCompanyMatch[1].trim();
    if (cand.length > 1 && !["We", "The", "Our", "Urgent", "New", "Opportunity", "Campus", "Notice", "College", "Attention"].includes(cand)) {
      company = cand;
    }
  }

  // Next, check known tech companies (order longer names first)
  if (!company) {
    const commonCompanies = [
      "Amazon Web Services", "Amazon", "Microsoft India", "Microsoft", "Google",
      "Apple", "Meta", "Netflix", "Oracle Cloud Infrastructure", "Oracle",
      "Salesforce", "Cisco", "Intel", "Adobe", "IBM", "TCS", "Infosys",
      "Wipro", "Cognizant", "Accenture", "Uber", "Flipkart", "Swiggy",
      "Zomato", "Goldman Sachs", "Morgan Stanley", "JPMorgan", "ISRO", "DRDO",
      "Ministry of Education", "Siemens", "Qualcomm", "NVIDIA", "Samsung"
    ];
    for (const c of commonCompanies) {
      const regex = new RegExp(`\\b${c.replace(/\s+/g, "\\s+")}\\b`, "i");
      if (regex.test(text)) {
        company = c;
        break;
      }
    }
  }

  // If still not found, check patterns like "[Company] is hiring" or "[Company] invites applications"
  if (!company) {
    const hiringPatterns = [
      /^([A-Z][A-Za-z0-9&.\s]{1,25})\s+is\s+(?:hiring|recruiting|looking)/im,
      /([A-Z][A-Za-z0-9&.\s]{1,25})\s+invites\s+applications/im,
      /\b(?:hiring\s+at)\s+([A-Z][A-Za-z0-9&.\s]{1,25})/i,
    ];
    for (const pat of hiringPatterns) {
      const match = text.match(pat);
      if (match && match[1]) {
        const cand = match[1].trim();
        if (!["We", "The", "Our", "Urgent", "New", "Opportunity", "Campus", "Notice", "College", "Attention"].includes(cand)) {
          company = cand;
          break;
        }
      }
    }
  }

  // 2. Title & Role extraction
  let title: string | null = null;
  const rolePatterns = [
    /(?:role|position|title|profile)\s*[:\-*]?\s*\*?([A-Za-z\s/()\-]{3,40}?)(?:\*|\n|\r|$)/i,
    /(?:for|as\s+a|as\s+an|recruiting|hiring)\s+([A-Za-z\s/()\-]{3,35}\s+(?:Intern(?:ship)?|Engineers?|Developers?|Analysts?|Associates?|Fellows?|Specialists?|Scientists?|Trainees?))/i,
    /([A-Za-z\s/()\-]{3,35}\s+(?:Intern(?:ship)?|Engineers?|Developers?|Analysts?|Associates?|Fellows?|Specialists?|Scientists?|Trainees?))/i,
    /(Smart India Hackathon\s*[0-9]*|SIH\s*[0-9]*|Google Summer of Code\s*[0-9]*|GSoC)/i,
  ];

  for (const pat of rolePatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const cand = match[1].replace(/[*_#]+/g, "").trim();
      if (cand.length > 2 && cand.length < 50 && !["We", "The", "Our", "Company"].includes(cand)) {
        title = cand;
        break;
      }
    }
  }

  // 3. Type
  let type: OpportunityType | null = null;
  if (lower.includes("internship") || lower.includes("intern")) {
    type = "internship";
  } else if (lower.includes("hackathon") || lower.includes("contest") || lower.includes("coding challenge")) {
    type = "hackathon";
  } else if (lower.includes("scholarship") || lower.includes("fellowship")) {
    type = "scholarship";
  } else if (lower.includes("workshop") || lower.includes("bootcamp") || lower.includes("webinar")) {
    type = "workshop";
  } else if (lower.includes("competition")) {
    type = "competition";
  } else if (lower.includes("full-time") || lower.includes("full time") || lower.includes("job") || lower.includes("fte") || lower.includes("placement")) {
    type = "job";
  }

  // 4. Department
  let department: string | null = null;
  if (/\b(?:CSE|Computer Science)\b/i.test(text)) department = "CSE";
  else if (/\b(?:ECE|Electronics)\b/i.test(text)) department = "ECE";
  else if (/\b(?:MECH|Mechanical)\b/i.test(text)) department = "MECH";
  else if (/\b(?:CIVIL|Civil)\b/i.test(text)) department = "CIVIL";
  else if (/\b(?:all\s+branches|all\s+departments|any\s+branch)\b/i.test(text)) department = "All";

  // 5. Academic Year
  let year: number | null = null;
  if (/\b(?:1st\s+year|first\s+year)\b/i.test(text)) year = 1;
  else if (/\b(?:2nd\s+year|second\s+year)\b/i.test(text)) year = 2;
  else if (/\b(?:3rd\s+year|third\s+year)\b/i.test(text)) year = 3;
  else if (/\b(?:4th\s+year|fourth\s+year|final\s+year|graduating\s+batch)\b/i.test(text)) year = 4;

  // 6. Eligibility
  let eligibility: string | null = null;
  const eligMatch = text.match(/(?:eligibility|eligible|criteria)\s*[:\-]?\s*([^\n\r.]+)/i);
  if (eligMatch && eligMatch[1]) {
    eligibility = eligMatch[1].replace(/[*_#]+/g, "").trim();
  } else if (department || year) {
    const parts = [];
    if (year) parts.push(`Year ${year}`);
    if (department) parts.push(department);
    eligibility = parts.join(" ");
  }

  // 7. Skills
  const knownSkills = [
    "Python", "React", "Node.js", "Java", "C++", "C#", "JavaScript",
    "TypeScript", "Go", "Rust", "SQL", "MongoDB", "PostgreSQL",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Git", "Machine Learning",
    "Deep Learning", "AI", "Data Structures", "Algorithms", "System Design",
    "Next.js", "HTML", "CSS", "Tailwind", "Spring Boot", "FastAPI"
  ];
  const detectedSkills = knownSkills.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    return regex.test(text);
  });
  const skills = detectedSkills.length > 0 ? detectedSkills : null;

  // 8. Stipend
  let stipend: string | null = null;
  const stipendMatch = text.match(
    /(?:stipend|salary|pay)\s*[:\-*]?\s*\*?([₹$]?[0-9,]+(?:\s*(?:k|thousand|lac|lakh))?(?:\s*\/\s*(?:month|mo|pm))?)/i
  ) || text.match(/([₹$]?[0-9,]+(?:\s*k)?\s*\/\s*month)/i);
  if (stipendMatch && stipendMatch[1]) {
    stipend = stipendMatch[1].replace(/[*_#]+/g, "").trim();
  }

  // 9. Package
  let pkg: string | null = null;
  const pkgMatch = text.match(
    /(?:ctc|package|compensation)\s*[:\-*]?\s*\*?([0-9.]+\s*(?:LPA|lpa|Lakhs?|L))|([0-9.]+\s*(?:LPA|lpa)\s*(?:CTC)?)/i
  );
  if (pkgMatch) {
    pkg = (pkgMatch[1] || pkgMatch[2]).replace(/[*_#]+/g, "").trim();
  }

  // 10. Location & Work Mode
  let location: string | null = null;
  const cities = ["Bangalore", "Bengaluru", "Hyderabad", "Noida", "Gurgaon", "Pune", "Mumbai", "Chennai", "Delhi"];
  for (const city of cities) {
    if (new RegExp(`\\b${city}\\b`, "i").test(text)) {
      location = city;
      break;
    }
  }

  let work_mode: "On-site" | "Remote" | "Hybrid" | null = null;
  if (/\b(?:remote|work\s+from\s+home|wfh)\b/i.test(text)) {
    work_mode = "Remote";
    if (!location) location = "Remote";
  } else if (/\bhybrid\b/i.test(text)) {
    work_mode = "Hybrid";
  } else if (/\b(?:on-site|onsite|in-office|office)\b/i.test(text)) {
    work_mode = "On-site";
  }

  // 11. Deadline (Strict: never hallucinate if not present)
  let deadline: string | null = null;
  // First, check explicit YYYY-MM-DD pattern
  const isoMatch = text.match(/(?:deadline|apply\s+before|last\s+date|before|due\s+date)\s*[:\-*]?\s*\*?([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
  if (isoMatch && isoMatch[1]) {
    deadline = isoMatch[1];
  } else {
    // Check Month Day e.g. "September 18" or "18 September"
    const generalMatch = text.match(
      /(?:deadline|apply\s+before|last\s+date|before|due\s+date)\s*[:\-*]?\s*\*?([A-Za-z]+\s+[0-9]{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*[0-9]{4})?|[0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+(?:\s*,?\s*[0-9]{4})?)/i
    );
    if (generalMatch && generalMatch[1]) {
      const rawDateStr = generalMatch[1].replace(/(?:st|nd|rd|th)/g, "").trim();
      const currentYear = new Date().getFullYear();
      const withYear = /\d{4}/.test(rawDateStr) ? rawDateStr : `${rawDateStr} ${currentYear}`;
      const parsed = new Date(withYear);
      if (!isNaN(parsed.getTime())) {
        deadline = parsed.toISOString().split("T")[0];
      }
    }
  }

  // 12. Application URL (Strict: only if actual URL found)
  let application_url: string | null = null;
  const urlMatch = text.match(/(https?:\/\/[^\s]+)/i);
  if (urlMatch && urlMatch[1]) {
    application_url = urlMatch[1].replace(/[.,;:)]+$/, ""); // Trim trailing punctuation
  }

  return {
    title,
    company,
    type,
    description: text.length > 200 ? text.substring(0, 300) + "..." : text,
    eligibility,
    department,
    year,
    skills,
    stipend,
    package: pkg,
    location,
    work_mode,
    deadline,
    application_url,
  };
}

/**
 * Main Extraction Function
 * 1. Validates input bounds.
 * 2. Attempts LLM API if key is present (with 10s timeout and error safety).
 * 3. Falls back seamlessly to deterministic heuristic extractor.
 */
export async function performOpportunityExtraction(
  rawText: string
): Promise<ExtractionResult> {
  if (!rawText || typeof rawText !== "string") {
    return { success: false, error: "Please provide opportunity announcement text." };
  }

  const trimmed = rawText.trim();
  if (trimmed.length < 15) {
    return {
      success: false,
      error: "The provided announcement is too short (minimum 15 characters required for extraction).",
    };
  }

  if (trimmed.length > 10000) {
    return {
      success: false,
      error: "The provided announcement is too long (maximum 10,000 characters). Please paste the core opportunity notice.",
    };
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openAiApiKey = process.env.OPENAI_API_KEY;

  // Attempt external LLM if Gemini API key exists
  if (geminiApiKey && !geminiApiKey.includes("placeholder")) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT },
              { text: `Announcement text to extract from:\n${trimmed}` },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.1, // Low temperature for deterministic anti-hallucination extraction
        },
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        const rawContent = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawContent) {
          const parsed = JSON.parse(rawContent);
          const validated = validateExtractedOpportunity(parsed);
          if (validated.valid && validated.data) {
            return {
              success: true,
              data: validated.data,
              sourceText: trimmed,
              isFallback: false,
            };
          }
        }
      }
    } catch (err: any) {
      console.warn("External Gemini API call failed or timed out. Falling back to local extractor:", err?.message || err);
    }
  }

  // Attempt OpenAI if configured
  if (openAiApiKey && !openAiApiKey.includes("placeholder")) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: trimmed },
          ],
          temperature: 0.1,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        const content = result?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          const validated = validateExtractedOpportunity(parsed);
          if (validated.valid && validated.data) {
            return {
              success: true,
              data: validated.data,
              sourceText: trimmed,
              isFallback: false,
            };
          }
        }
      }
    } catch (err: any) {
      console.warn("External OpenAI call failed or timed out. Falling back to local extractor:", err?.message || err);
    }
  }

  // Built-in intelligent heuristic extractor (offline / demo / fallback guarantee)
  try {
    const extracted = extractHeuristically(trimmed);
    const validated = validateExtractedOpportunity(extracted);
    return {
      success: true,
      data: validated.data,
      sourceText: trimmed,
      isFallback: true,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Extraction failed: ${err?.message || "Unexpected error during extraction"}`,
      sourceText: trimmed,
    };
  }
}
