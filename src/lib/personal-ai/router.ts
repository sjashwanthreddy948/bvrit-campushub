/**
 * CampusHub AI — Automatic Context Router
 * 
 * Accurately determines query category:
 * - TYPE A: CampusHub Data Questions (Retrieves verified campus DB records)
 * - TYPE B: Personalized Guidance Questions (Combines student profile + placement trends + advice)
 * - TYPE C: General Knowledge & Technical Questions (Answers directly as expert programming & general AI)
 */

import { QueryClassification, PersonalAiIntent } from "./types";

export interface RoutedQuery {
  classification: QueryClassification;
  intent: PersonalAiIntent;
  targetSubject?: string;
}

export function routeUserQuery(rawQuery: string): RoutedQuery {
  const q = rawQuery.trim().toLowerCase();

  // =========================================================================
  // 1. TYPE A — CAMPUSHUB DATA QUESTIONS
  // =========================================================================

  // Tomorrow schedule
  if (
    q.includes("tomorrow") ||
    q.includes("happening tomorrow") ||
    q.includes("tomorrow's plan") ||
    q.includes("tomorrows plan") ||
    q.includes("what is tomorrow") ||
    q.includes("whats tomorrow") ||
    q.includes("what's tomorrow") ||
    q.includes("tomorrow schedule")
  ) {
    return { classification: "type_a_campushub", intent: "tomorrow" };
  }

  // Application status
  if (
    q.includes("my application") ||
    q.includes("application status") ||
    q.includes("have i applied") ||
    q.includes("did i apply") ||
    q.includes("my applications") ||
    q.includes("where did i apply") ||
    q.includes("status of my")
  ) {
    return { classification: "type_a_campushub", intent: "application_status" };
  }

  // Deadlines & Assignments
  if (
    q.includes("upcoming deadline") ||
    q.includes("deadlines") ||
    q.includes("due date") ||
    q.includes("due soon") ||
    q.includes("what is due") ||
    q.includes("whats due") ||
    q.includes("what's due") ||
    q.includes("assignments due") ||
    q.includes("pending assignment") ||
    q.includes("my assignments") ||
    q.includes("what assignments")
  ) {
    return { classification: "type_a_campushub", intent: "upcoming_deadlines" };
  }

  // Eligibility check for specific drive
  if (
    (q.includes("eligible for") || q.includes("am i eligible") || q.includes("can i apply for")) &&
    (q.includes("amazon") || q.includes("google") || q.includes("jpmorgan") || q.includes("qualcomm") || q.includes("drive") || q.includes("opportunity"))
  ) {
    return { classification: "type_a_campushub", intent: "eligibility_check" };
  }

  // Opportunity matching on CampusHub
  if (
    q.includes("suit me") ||
    q.includes("which opportunities") ||
    q.includes("opportunities suit") ||
    q.includes("opportunities match") ||
    q.includes("match my profile") ||
    q.includes("matched opportunit") ||
    q.includes("jobs on campus") ||
    q.includes("internships on campus") ||
    q.includes("what should i apply for on campushub")
  ) {
    return { classification: "type_a_campushub", intent: "opportunity_matching" };
  }

  // Summarize circular or opportunity
  if (
    (q.includes("summarize") || q.includes("summary of") || q.includes("overview of")) &&
    (q.includes("circular") || q.includes("notice") || q.includes("opportunity") || q.includes("drive") || q.includes("amazon") || q.includes("cognizant") || q.includes("placement"))
  ) {
    return { classification: "type_a_campushub", intent: "summarize_item" };
  }

  // Campus circulars
  if (
    q.includes("circular") ||
    q.includes("circulars") ||
    q.includes("official notice") ||
    q.includes("college notice")
  ) {
    return { classification: "type_a_campushub", intent: "summarize_item" };
  }

  // Campus transport, routes, bus
  if (q.includes("bus route") || q.includes("college bus") || q.includes("transport") || q.includes("bvrit transport")) {
    return { classification: "type_a_campushub", intent: "general_query" };
  }

  // =========================================================================
  // 2. TYPE B — PERSONALIZED GUIDANCE QUESTIONS
  // =========================================================================

  // Skill gaps ("What am I weak at?", "What skills am I missing?")
  if (
    q.includes("weak at") ||
    q.includes("weakness") ||
    q.includes("what am i weak") ||
    q.includes("skill gap") ||
    q.includes("skills gap") ||
    q.includes("missing skill") ||
    q.includes("missing skills") ||
    q.includes("what am i missing") ||
    q.includes("lacking") ||
    q.includes("what skills should i add") ||
    q.includes("what skills am i missing")
  ) {
    return { classification: "type_b_guidance", intent: "skill_gaps" };
  }

  // "What should I learn next?" / "Which skill next?"
  if (
    q.includes("what should i learn next") ||
    q.includes("what to learn next") ||
    q.includes("next skill") ||
    q.includes("which skill should i learn") ||
    q.includes("learn next")
  ) {
    return { classification: "type_b_guidance", intent: "next_skill" };
  }

  // Placement prep roadmap
  if (
    q.includes("how should i prepare for placement") ||
    q.includes("how to prepare for placement") ||
    q.includes("prepare for placements") ||
    q.includes("placement prep") ||
    q.includes("campus placement preparation") ||
    q.includes("how to get placed") ||
    q.includes("crack placement") ||
    q.includes("crack placements")
  ) {
    return { classification: "type_b_guidance", intent: "placement_prep" };
  }

  // Technology choice (e.g. "React or Java", "Python or C++")
  if (
    (q.includes("should i learn") || q.includes("better to learn") || q.includes("which is better") || q.includes("vs")) &&
    (q.includes("react") || q.includes("java") || q.includes("python") || q.includes("c++") || q.includes("web") || q.includes("ai") || q.includes("ml"))
  ) {
    return { classification: "type_b_guidance", intent: "tech_choice" };
  }

  // Resume advice
  if (
    q.includes("improve my resume") ||
    q.includes("resume review") ||
    q.includes("resume tips") ||
    q.includes("how is my resume") ||
    q.includes("ats resume") ||
    q.includes("resume advice")
  ) {
    return { classification: "type_b_guidance", intent: "resume_advice" };
  }

  // Interview preparation
  if (
    q.includes("prepare for interview") ||
    q.includes("coding interview") ||
    q.includes("technical interview") ||
    q.includes("hr interview") ||
    q.includes("interview questions") ||
    q.includes("interview prep")
  ) {
    return { classification: "type_b_guidance", intent: "interview_prep" };
  }

  // General improvement steps
  if (
    q.includes("how can i improve") ||
    q.includes("how to improve") ||
    q.includes("how do i improve") ||
    q.includes("career advice") ||
    q.includes("next steps")
  ) {
    return { classification: "type_b_guidance", intent: "improvement_steps" };
  }

  // =========================================================================
  // 3. TYPE C — GENERAL KNOWLEDGE & PROGRAMMING QUESTIONS
  // =========================================================================

  // Algorithm explanations (Binary search, Two pointers, Sorting, DP)
  if (
    q.includes("binary search") ||
    q.includes("two pointer") ||
    q.includes("sliding window") ||
    q.includes("linked list") ||
    q.includes("binary tree") ||
    q.includes("binary search tree") ||
    q.includes("graph") ||
    q.includes("dijkstra") ||
    q.includes("dynamic programming") ||
    q.includes("recursion") ||
    q.includes("sorting") ||
    q.includes("merge sort") ||
    q.includes("quick sort") ||
    q.includes("bubble sort") ||
    q.includes("big o") ||
    q.includes("time complexity") ||
    q.includes("space complexity")
  ) {
    return { classification: "type_c_general", intent: "algorithm_explanation" };
  }

  // Framework & Programming concepts (React, Next.js, Node, Python, Java)
  if (
    q.includes("react") ||
    q.includes("hooks") ||
    q.includes("usestate") ||
    q.includes("useeffect") ||
    q.includes("virtual dom") ||
    q.includes("next.js") ||
    q.includes("javascript") ||
    q.includes("typescript") ||
    q.includes("python") ||
    q.includes("java") ||
    q.includes("c++") ||
    q.includes("oop") ||
    q.includes("polymorphism") ||
    q.includes("inheritance")
  ) {
    return { classification: "type_c_general", intent: "programming_help" };
  }

  // Databases & SQL concepts
  if (
    q.includes("database normalization") ||
    q.includes("normalization") ||
    q.includes("1nf") ||
    q.includes("2nf") ||
    q.includes("3nf") ||
    q.includes("bcnf") ||
    q.includes("acid") ||
    q.includes("sql") ||
    q.includes("indexing") ||
    q.includes("primary key") ||
    q.includes("foreign key") ||
    q.includes("mongodb")
  ) {
    return { classification: "type_c_general", intent: "concept_explanation" };
  }

  // Debugging code
  if (
    q.includes("debug") ||
    q.includes("error in code") ||
    q.includes("why is this failing") ||
    q.includes("fix this code") ||
    q.includes("syntax error") ||
    q.includes("nullpointer") ||
    q.includes("undefined is not")
  ) {
    return { classification: "type_c_general", intent: "code_debugging" };
  }

  // Professional writing (Emails, cover letters)
  if (
    q.includes("write an email") ||
    q.includes("professional email") ||
    q.includes("cold email") ||
    q.includes("email to hr") ||
    q.includes("email to professor") ||
    q.includes("cover letter") ||
    q.includes("thank you email")
  ) {
    return { classification: "type_c_general", intent: "professional_writing" };
  }

  // If none matched, classify as general AI query (Type C) so the assistant answers naturally
  return { classification: "type_c_general", intent: "general_ai" };
}
