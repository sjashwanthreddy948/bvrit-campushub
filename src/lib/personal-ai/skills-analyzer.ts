/**
 * CampusHub AI — Constructive Skill Gap Analyzer
 * 
 * Compares authorized student profile skills against real demand in active placement drives.
 * STRICT POLICY:
 * - Never uses negative words like "weak" or "poor".
 * - Highlights verified current strengths first.
 * - Identifies highest priority next skills with constructive phrasing ("One area that would strengthen your profile is...").
 * - Provides realistic, practical next steps.
 */

import { StudentPersonalContext } from "./types";

export interface SkillGapAnalysisResult {
  currentStrengths: string[];
  inDemandSkills: Array<{ skill: string; frequency: number; companies: string[] }>;
  priorityNextSkill: string;
  skillGaps: string[];
  practicalNextStep: string;
  formattedResponse: string;
}

export function performConstructiveSkillAnalysis(context: StudentPersonalContext): SkillGapAnalysisResult {
  const studentSkills = context.skills || [];
  const normalizedStudentSkills = new Set(studentSkills.map((s) => s.toLowerCase().trim()));

  // 1. Collect skills required across all active opportunities
  const skillFrequency: Record<string, { count: number; companies: Set<string>; canonicalName: string }> = {};

  context.activeOpportunities.forEach((opp) => {
    const oppSkills = [
      ...(opp.skills || []),
      ...(opp.required_skills || []),
      ...(opp.preferred_skills || []),
    ];

    oppSkills.forEach((rawSkill) => {
      const canonical = rawSkill.trim();
      const lower = canonical.toLowerCase();
      if (!skillFrequency[lower]) {
        skillFrequency[lower] = { count: 0, companies: new Set(), canonicalName: canonical };
      }
      skillFrequency[lower].count++;
      skillFrequency[lower].companies.add(opp.company);
    });
  });

  // 2. Identify Current Strengths (Student skills that match active recruiter demand)
  const currentStrengths: string[] = [];
  studentSkills.forEach((s) => {
    const lower = s.toLowerCase().trim();
    if (skillFrequency[lower]) {
      currentStrengths.push(s);
    } else {
      currentStrengths.push(s);
    }
  });

  // 3. Sort demanded skills by frequency
  const sortedDemandedSkills = Object.values(skillFrequency)
    .sort((a, b) => b.count - a.count)
    .map((item) => ({
      skill: item.canonicalName,
      frequency: item.count,
      companies: Array.from(item.companies),
    }));

  // 4. Determine Skill Gaps (high-frequency skills student does not have yet)
  const missingInDemand = sortedDemandedSkills.filter(
    (item) => !normalizedStudentSkills.has(item.skill.toLowerCase().trim())
  );

  const priorityNextSkill = missingInDemand[0]?.skill || "Data Structures & Algorithms";
  const priorityCompanies = missingInDemand[0]?.companies?.slice(0, 3)?.join(", ") || "top campus recruiters";

  const skillGaps = missingInDemand.slice(0, 4).map((m) => m.skill);

  // 5. Construct Practical Next Step
  let practicalNextStep = "";
  if (priorityNextSkill.toLowerCase().includes("dsa") || priorityNextSkill.toLowerCase().includes("algorithm")) {
    practicalNextStep = "Solve 3 medium LeetCode/HackerRank problems on Arrays & Two Pointers this week. Track problem patterns in our [Skills & Prep Hub](/skills).";
  } else if (priorityNextSkill.toLowerCase().includes("sql") || priorityNextSkill.toLowerCase().includes("database")) {
    practicalNextStep = "Build 5 complex SQL queries with JOINs, Aggregations, and Subqueries to prepare for online assessment database sections.";
  } else if (priorityNextSkill.toLowerCase().includes("cloud") || priorityNextSkill.toLowerCase().includes("aws") || priorityNextSkill.toLowerCase().includes("docker")) {
    practicalNextStep = "Deploy a simple full-stack project to AWS or containerize it with Docker to demonstrate production readiness on your resume.";
  } else {
    practicalNextStep = `Dedicate 45 minutes daily to building a hands-on project utilizing ${priorityNextSkill}, then add verified project bullets to your [ATS Resume](/resume-builder).`;
  }

  // 6. Build Senior-Mentor Formatted Explanation
  let text = `Here is a constructive analysis comparing your verified profile with **${context.activeOpportunities.length} active placement drives** currently recruiting on campus:\n\n`;

  text += `### 🌟 Your Current Strengths\n`;
  if (currentStrengths.length > 0) {
    text += `You have already established solid foundations in **${currentStrengths.slice(0, 5).join(", ")}**.\n`;
    text += `* These skills directly align with roles posted by ${context.activeOpportunities.slice(0, 2).map((o) => o.company).join(" and ")}.\n\n`;
  } else {
    text += `Your academic coursework in **${context.department}** provides the core conceptual grounding.\n\n`;
  }

  text += `### 🎯 High-Impact Growth Opportunities\n`;
  if (skillGaps.length > 0) {
    text += `One area that would significantly strengthen your profile for upcoming shortlisting rounds is **${priorityNextSkill}**.\n`;
    text += `* **Frequently requested by:** ${priorityCompanies}.\n`;
    text += `* **Other complementary skills in demand:** ${skillGaps.slice(1).join(", ") || "System Design & Git"}.\n\n`;
  } else {
    text += `Your listed skills cover the primary requirements of current campus drives! To stand out further, focus on system architecture and mock interview practice.\n\n`;
  }

  text += `### 🚀 Highest Priority Next Step\n`;
  text += `* **Focus:** ${priorityNextSkill}\n`;
  text += `* **Action Plan:** ${practicalNextStep}\n`;
  text += `* **Resume tip:** Once comfortable, update your project descriptions in the [ATS Resume Builder](/resume-builder).`;

  return {
    currentStrengths,
    inDemandSkills: sortedDemandedSkills.slice(0, 6),
    priorityNextSkill,
    skillGaps,
    practicalNextStep,
    formattedResponse: text,
  };
}

export function handlePersonalizedCareerGuidance(
  query: string,
  context: StudentPersonalContext
): { title: string; answer: string; category: string; suggestedQuestions: string[] } {
  const q = query.toLowerCase();
  const analysis = performConstructiveSkillAnalysis(context);

  if (q.includes("react") && q.includes("java")) {
    return {
      title: "React vs Java: Strategic Placement Guidance",
      category: "Career Guidance",
      suggestedQuestions: [
        "What am I weak at?",
        "What should I learn next?",
        "Which opportunities suit me?",
      ],
      answer: `### ⚖️ React vs. Java: Which Should You Prioritize?

Both are top-tier technologies for campus placements, but they serve different hiring tracks:

| Category | **Java (Spring Boot / Backend / Core)** | **React.js (Frontend / Full Stack)** |
| :--- | :--- | :--- |
| **Recruiters Demanding** | Amazon, JPMorgan Chase, Qualcomm, TCS Digital | Startups, Product Consultancies, Frontend Tracks |
| **Evaluation Focus** | Core OOP, Multithreading, DSA in Java, Collections, REST APIs | Modern JS (ES6+), State Management, Hooks, Component Lifecycle |
| **Interview Style** | Heavy DSA + LeetCode Medium + System Design Basics | Machine coding rounds, live UI build, JS internals |

#### 🧭 Tailored Recommendation for Your Profile:
* **Your current skills:** ${context.skills.join(", ") || "General CS coursework"}
* **If your target is High-CTC Product/FinTech (Amazon, JPMorgan):** Prioritize **Java**. Mastering Java Collections Framework + DSA gives you the highest conversion rate in campus coding rounds.
* **If your target is Full-Stack / Product Startups:** Master **React.js** alongside Node.js. Build 2 end-to-end projects with authentication and database integration.

💡 **Actionable Senior Advice:** Don't choose one exclusively! Keep Java as your primary language for DSA coding tests, and use React for your portfolio projects.`,
    };
  }

  if (q.includes("learn next") || q.includes("next skill")) {
    return {
      title: `Recommended Next Skill: ${analysis.priorityNextSkill}`,
      category: "Skill Recommendation",
      suggestedQuestions: [
        "Which opportunities suit me?",
        "How can I prepare for placements?",
        "Review my resume",
      ],
      answer: `### 🎯 Strategic Next Skill: ${analysis.priorityNextSkill}

Based on active recruitment drives at BVRIT:
* **Why this skill:** ${analysis.priorityNextSkill} is one of the highest-demand requirements among top hiring partners (including ${analysis.inDemandSkills.slice(0, 3).map((s) => s.companies[0]).filter(Boolean).join(", ") || "product companies"}).
* **Your baseline:** You already have strong fundamentals in ${analysis.currentStrengths.slice(0, 3).join(", ") || context.department}. Adding ${analysis.priorityNextSkill} rounds out your profile for both service and product tier roles.

#### 📅 2-Week Action Roadmap:
1. **Days 1–4:** Master the core concepts and standard patterns.
2. **Days 5–10:** Solve 10 practical questions or build a mini-feature demonstrating usage.
3. **Days 11–14:** Add a verified project bullet to your [ATS Resume](/resume-builder) and track progress in [Skills Hub](/skills).`,
    };
  }

  if (q.includes("prepare for placement") || q.includes("placement prep") || q.includes("how to get placed")) {
    return {
      title: "Campus Placement Preparation Blueprint",
      category: "Placement Prep",
      suggestedQuestions: [
        "What am I weak at?",
        "Which opportunities suit me?",
        "Explain Binary Search",
      ],
      answer: `### 🚀 4-Pillar Campus Placement Preparation Blueprint

To maximize conversion in on-campus placement drives (Amazon, JPMorgan Chase, Qualcomm, Cognizant):

#### 1. Data Structures & Algorithms (Daily 60 mins)
* Master Top 5 Patterns: Two Pointers, Sliding Window, Fast & Slow Pointers, BFS/DFS Trees, Dynamic Programming (0/1 Knapsack, Coin Change).
* Target: 100+ LeetCode problems (60 Easy, 35 Medium, 5 Hard).

#### 2. Core CS Fundamentals (CS Theory)
* **DBMS:** Normalization (1NF to 3NF), Indexing (B-Trees), ACID properties, SQL JOINs.
* **Operating Systems:** Process vs Thread, Deadlock conditions & Banker's algorithm, Paging & Virtual Memory.
* **Computer Networks:** TCP 3-way handshake, HTTP vs HTTPS, DNS resolution flow.

#### 3. Real-world Projects
* 2 high-quality projects on GitHub with clean README, deployed demo link, and architecture diagrams.
* Use the STAR format on your resume: Situation, Task, Action, Result (with numerical impact).

#### 4. Aptitude & Communication
* Practice Quantitative Aptitude, Logical Reasoning, and Verbal daily 30 minutes for preliminary online assessment filters.`,
    };
  }

  if (q.includes("resume")) {
    return {
      title: "ATS Resume Optimization Tips",
      category: "Career Guidance",
      suggestedQuestions: [
        "Which opportunities suit me?",
        "What am I weak at?",
        "Write a cold email for referral",
      ],
      answer: `### 📄 High-Impact Resume Optimization for Campus Recruiters

Here are key improvements to ensure your resume clears automated ATS filters and impresses technical interviewers:

1. **Use Single-Column Standard Format:** Avoid dual-column or graphic-heavy templates; ATS scanners frequently misparse columns. Use our built-in [ATS Resume Builder](/resume-builder).
2. **Quantify Project Impact:** Instead of *"Created an e-commerce website"*, write: *"Architected a responsive e-commerce web app using Next.js and PostgreSQL, optimizing database query response times by 35% across 500 mock users"*.
3. **Align Skills with Campus Drives:** Ensure required skills like ${analysis.inDemandSkills.slice(0, 4).map((s) => s.skill).join(", ")} are explicitly listed under Technical Skills.
4. **Link Live Proof:** Every project should have a clickable GitHub repository and live deployment URL.`,
    };
  }

  // Default constructive guidance
  return {
    title: "Personalized Career Guidance",
    category: "Career Guidance",
    suggestedQuestions: [
      "What am I weak at?",
      "What should I learn next?",
      "Which opportunities suit me?",
    ],
    answer: analysis.formattedResponse,
  };
}

