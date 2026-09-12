"use server";

import { getCurrentSessionUser } from "@/lib/auth/actions";
import { PersonalAiResponse } from "./types";
import { processPersonalAiQuery, getAuthorizedStudentContext } from "./engine";

/**
 * Server Action: Ask Personal CampusHub AI
 * Error handling guarantee: Never crashes the page.
 * If AI service fails, gracefully returns official fallback.
 */
export async function askPersonalCampusAi(question: string): Promise<PersonalAiResponse> {
  try {
    const sessionUser = await getCurrentSessionUser();
    const studentId = sessionUser?.id || "demo-student-id";

    if (!question || question.trim().length === 0) {
      return {
        intent: "general_query",
        title: "CampusHub AI Guide",
        answer: "Please enter a question about your tomorrow schedule, upcoming deadlines, matching opportunities, or skill improvement.",
        suggestedQuestions: [
          "What is happening tomorrow?",
          "Upcoming deadlines",
          "Which opportunities suit me?",
          "What am I weak at?",
          "How can I improve?",
        ],
        category: "General",
      };
    }

    return await processPersonalAiQuery(question.trim(), studentId);
  } catch (error) {
    console.error("CampusHub AI processing error:", error);
    return {
      intent: "general_query",
      title: "Service Notice",
      answer: "CampusHub AI is temporarily unavailable. You can still view the information directly via [Opportunities](/opportunities), [Circulars](/circulars), or [Assignments](/assignments).",
      suggestedQuestions: [
        "What is happening tomorrow?",
        "Upcoming deadlines",
        "Which opportunities suit me?",
      ],
      category: "System",
    };
  }
}

/**
 * Server Action: Get Personalized Initial Greeting & Context
 */
export async function getPersonalAiInitialGreeting(): Promise<{
  greeting: string;
  studentName: string;
  department: string;
  year: number;
  suggestedQuestions: string[];
}> {
  try {
    const sessionUser = await getCurrentSessionUser();
    const studentId = sessionUser?.id || "demo-student-id";
    const context = await getAuthorizedStudentContext(studentId);
    const firstName = context.fullName.split(" ")[0] || "Friend";

    const greeting = `Hey ${firstName}! 👋 I'm your **CampusHub AI** personal campus and career guide.\n\nI understand your cohort (**${context.department}**, Year **${context.year}**), your verified skills, pending assignments, and bookmarked opportunities.\n\nTap any suggested topic below or type your question:`;

    return {
      greeting,
      studentName: context.fullName,
      department: context.department,
      year: context.year,
      suggestedQuestions: [
        "What is happening tomorrow?",
        "Upcoming deadlines",
        "Which opportunities suit me?",
        "What am I weak at?",
        "How can I improve?",
        "Summarize recent circulars",
      ],
    };
  } catch (err) {
    return {
      greeting: "Hey there! 👋 I'm your **CampusHub AI** personal guide. How can I help you today?",
      studentName: "Student",
      department: "CSE",
      year: 3,
      suggestedQuestions: [
        "What is happening tomorrow?",
        "Upcoming deadlines",
        "Which opportunities suit me?",
        "What am I weak at?",
        "How can I improve?",
      ],
    };
  }
}
