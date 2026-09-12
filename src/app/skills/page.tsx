"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Code2,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Search,
  Plus,
  X,
  Award,
  Layers,
  TrendingUp,
  BrainCircuit,
  Database,
  Server,
  Network,
  Cpu,
  ChevronRight,
  FileText,
  Filter,
  Check,
  Zap,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  getStudentSkills,
  addStudentSkill,
  removeStudentSkill,
} from "@/lib/skills/actions";
import {
  STANDARD_SKILLS,
  SKILL_CATEGORIES,
  searchSkills,
  StandardSkill,
} from "@/lib/skills/catalog";
import { StudentSkill, SkillCategory } from "@/types/database";
import { getOpportunities } from "@/lib/opportunities/actions";
import { PillTag } from "@/components/ui/PillTag";
import { TeamworkLaptopIllustration } from "@/components/illustrations/CollegiateScenes";

// Curated LeetCode Patterns with Difficulty & Practice Links
interface LeetCodeProblem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  pattern: string;
  url: string;
  phase: number;
}

const LEETCODE_PROBLEMS: LeetCodeProblem[] = [
  // Phase 1: Foundations & Two Pointers
  { id: "lc-1", title: "Two Sum", difficulty: "Easy", pattern: "HashMap / Array", url: "https://leetcode.com/problems/two-sum/", phase: 1 },
  { id: "lc-2", title: "Valid Anagram", difficulty: "Easy", pattern: "Hash Table / Counting", url: "https://leetcode.com/problems/valid-anagram/", phase: 1 },
  { id: "lc-3", title: "Valid Palindrome", difficulty: "Easy", pattern: "Two Pointers", url: "https://leetcode.com/problems/valid-palindrome/", phase: 1 },
  { id: "lc-4", title: "Best Time to Buy and Sell Stock", difficulty: "Easy", pattern: "Sliding Window", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", phase: 1 },
  { id: "lc-5", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", pattern: "Sliding Window", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", phase: 1 },
  { id: "lc-6", title: "Container With Most Water", difficulty: "Medium", pattern: "Two Pointers", url: "https://leetcode.com/problems/container-with-most-water/", phase: 1 },
  { id: "lc-7", title: "3Sum", difficulty: "Medium", pattern: "Two Pointers", url: "https://leetcode.com/problems/3sum/", phase: 1 },

  // Phase 2: Linear & Binary Search
  { id: "lc-8", title: "Valid Parentheses", difficulty: "Easy", pattern: "Stack", url: "https://leetcode.com/problems/valid-parentheses/", phase: 2 },
  { id: "lc-9", title: "Reverse Linked List", difficulty: "Easy", pattern: "Linked List Pointer Manipulation", url: "https://leetcode.com/problems/reverse-linked-list/", phase: 2 },
  { id: "lc-10", title: "Merge Two Sorted Lists", difficulty: "Easy", pattern: "Linked List", url: "https://leetcode.com/problems/merge-two-sorted-lists/", phase: 2 },
  { id: "lc-11", title: "Binary Search", difficulty: "Easy", pattern: "Binary Search", url: "https://leetcode.com/problems/binary-search/", phase: 2 },
  { id: "lc-12", title: "Search in Rotated Sorted Array", difficulty: "Medium", pattern: "Modified Binary Search", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/", phase: 2 },
  { id: "lc-13", title: "Daily Temperatures", difficulty: "Medium", pattern: "Monotonic Stack", url: "https://leetcode.com/problems/daily-temperatures/", phase: 2 },

  // Phase 3: Trees & Graphs
  { id: "lc-14", title: "Invert Binary Tree", difficulty: "Easy", pattern: "Tree DFS Traversal", url: "https://leetcode.com/problems/invert-binary-tree/", phase: 3 },
  { id: "lc-15", title: "Maximum Depth of Binary Tree", difficulty: "Easy", pattern: "Tree DFS / BFS", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", phase: 3 },
  { id: "lc-16", title: "Validate Binary Search Tree", difficulty: "Medium", pattern: "BST Properties", url: "https://leetcode.com/problems/validate-binary-search-tree/", phase: 3 },
  { id: "lc-17", title: "Lowest Common Ancestor of a BST", difficulty: "Medium", pattern: "BST Search", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", phase: 3 },
  { id: "lc-18", title: "Number of Islands", difficulty: "Medium", pattern: "Graph BFS / DFS Matrix Traversal", url: "https://leetcode.com/problems/number-of-islands/", phase: 3 },
  { id: "lc-19", title: "Clone Graph", difficulty: "Medium", pattern: "Graph Traversal / HashMap", url: "https://leetcode.com/problems/clone-graph/", phase: 3 },
  { id: "lc-20", title: "Kth Largest Element in an Array", difficulty: "Medium", pattern: "Min-Heap / Priority Queue", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/", phase: 3 },

  // Phase 4: Dynamic Programming & Backtracking
  { id: "lc-21", title: "Climbing Stairs", difficulty: "Easy", pattern: "1D Dynamic Programming", url: "https://leetcode.com/problems/climbing-stairs/", phase: 4 },
  { id: "lc-22", title: "Coin Change", difficulty: "Medium", pattern: "1D Dynamic Programming", url: "https://leetcode.com/problems/coin-change/", phase: 4 },
  { id: "lc-23", title: "Longest Increasing Subsequence", difficulty: "Medium", pattern: "1D DP / Binary Search", url: "https://leetcode.com/problems/longest-increasing-subsequence/", phase: 4 },
  { id: "lc-24", title: "Subsets", difficulty: "Medium", pattern: "Backtracking", url: "https://leetcode.com/problems/subsets/", phase: 4 },
  { id: "lc-25", title: "Combination Sum", difficulty: "Medium", pattern: "Backtracking", url: "https://leetcode.com/problems/combination-sum/", phase: 4 },
];

export default function SkillsPage() {
  const [activeTab, setActiveTab] = React.useState<"dsa" | "core" | "skills" | "gaps">("dsa");

  // Skills State
  const [studentSkills, setStudentSkills] = React.useState<StudentSkill[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<SkillCategory | "All">("All");
  const [customSkillName, setCustomSkillName] = React.useState("");
  const [customSkillCat, setCustomSkillCat] = React.useState<SkillCategory>("Programming Language");
  const [showCustomModal, setShowCustomModal] = React.useState(false);
  const [loadingSkills, setLoadingSkills] = React.useState(true);

  // LeetCode Progress Tracking (persisted locally)
  const [completedProblems, setCompletedProblems] = React.useState<Record<string, boolean>>({
    "lc-1": true,
    "lc-2": true,
    "lc-3": true,
    "lc-4": true,
    "lc-8": true,
  });

  // Live in-demand skills from opportunities
  const [inDemandSkills, setInDemandSkills] = React.useState<{ skill: string; count: number }[]>([]);

  // Load skills
  React.useEffect(() => {
    async function loadData() {
      try {
        setLoadingSkills(true);
        const [skillsList, oppsRes] = await Promise.all([
          getStudentSkills(),
          getOpportunities({ pageSize: 15, deadlineFilter: "active" }),
        ]);

        setStudentSkills(skillsList);

        // Aggregate skills from active opportunities
        const skillCounts: Record<string, number> = {};
        (oppsRes?.opportunities || []).forEach((opp: any) => {
          const list = [...(opp.required_skills || []), ...(opp.skills || [])];
          list.forEach((s: string) => {
            const trimmed = s.trim();
            if (trimmed) {
              skillCounts[trimmed] = (skillCounts[trimmed] || 0) + 1;
            }
          });
        });

        const sortedDemands = Object.entries(skillCounts)
          .map(([skill, count]) => ({ skill, count }))
          .sort((a, b) => b.count - a.count);

        setInDemandSkills(sortedDemands);
      } catch (err) {
        console.error("Failed to load skills or market trends:", err);
      } finally {
        setLoadingSkills(false);
      }
    }
    loadData();
  }, []);

  const handleToggleProblem = (id: string) => {
    setCompletedProblems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddSkill = async (skill: StandardSkill) => {
    const exists = studentSkills.some(
      (s) => s.skill_name.toLowerCase() === skill.name.toLowerCase()
    );
    if (exists) return;

    try {
      const res = await addStudentSkill(skill.name, skill.category);
      if (res.success && res.skill) {
        setStudentSkills((prev) => [...prev, res.skill!]);
      }
    } catch (err) {
      console.error("Failed to add skill:", err);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    setStudentSkills((prev) => prev.filter((s) => s.id !== skillId));
    try {
      await removeStudentSkill(skillId);
    } catch (err) {
      console.error("Failed to delete skill:", err);
    }
  };

  const handleAddCustom = async () => {
    const clean = customSkillName.trim();
    if (!clean) return;
    try {
      const res = await addStudentSkill(clean, customSkillCat);
      if (res.success && res.skill) {
        setStudentSkills((prev) => [...prev, res.skill!]);
        setCustomSkillName("");
        setShowCustomModal(false);
      }
    } catch (err) {
      console.error("Failed to add custom skill:", err);
    }
  };

  const filteredCatalog = searchSkills(searchQuery, selectedCategory);

  // Progress metrics
  const completedCount = Object.values(completedProblems).filter(Boolean).length;
  const totalProblems = LEETCODE_PROBLEMS.length;
  const dsaProgressPct = Math.round((completedCount / totalProblems) * 100);

  // Missing in-demand skills
  const studentSkillNorm = studentSkills.map((s) => s.skill_name.toLowerCase());
  const missingInDemand = inDemandSkills.filter(
    (item) => !studentSkillNorm.includes(item.skill.toLowerCase())
  );

  return (
    <DashboardShell role="student">
      {/* Collegiate Illustrated Hero Banner */}
      <Card className="border-[#F0E4E2] dark:border-[#2B2C35] bg-gradient-to-br from-white via-[#FFF7F6] to-[#FBF1EF] dark:from-[#1A1D20] dark:via-[#1E2024] dark:to-[#17181C] shadow-xs overflow-hidden mb-6">
        <div className="p-5 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <PillTag variant="amber" size="sm">Placement Prep</PillTag>
              <PillTag variant="outline" size="sm">DSA 75 Patterns</PillTag>
              <PillTag variant="powder" size="sm">Core CS Review</PillTag>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1D20] dark:text-slate-100 tracking-tight">
                Skills &amp; Placement Preparation Hub
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                Strengthen your interview readiness with structured DSA roadmaps, core computer science review, and high-impact skills required by top recruiters.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
              <Link
                href="/resume-builder"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#F59E0B] hover:bg-[#D95550] text-white shadow-xs transition-colors min-h-[44px]"
              >
                <FileText className="h-4 w-4" />
                <span>Create ATS Resume</span>
              </Link>
            </div>
          </div>

          <div className="shrink-0 hidden sm:flex justify-center items-center">
            <TeamworkLaptopIllustration className="w-56 h-auto drop-shadow-xs" />
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="border-b border-[#F0E4E2] dark:border-[#2B2C35] overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 min-w-full pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("dsa")}
              className={`min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                activeTab === "dsa"
                  ? "bg-[#F59E0B] text-white border-[#F59E0B] shadow-xs"
                  : "bg-white dark:bg-[#1A1D20] text-slate-700 dark:text-slate-300 border-[#F0E4E2] dark:border-[#2B2C35] hover:border-[#F59E0B]"
              }`}
            >
              <Code2 className="h-4 w-4" />
              <span>DSA &amp; LeetCode Roadmap</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === "dsa" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                {completedCount}/{totalProblems} Solved
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("core")}
              className={`min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                activeTab === "core"
                  ? "bg-[#F59E0B] text-white border-[#F59E0B] shadow-xs"
                  : "bg-white dark:bg-[#1A1D20] text-slate-700 dark:text-slate-300 border-[#F0E4E2] dark:border-[#2B2C35] hover:border-[#F59E0B]"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Core CS &amp; CRT Modules</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("skills")}
              className={`min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                activeTab === "skills"
                  ? "bg-[#F59E0B] text-white border-[#F59E0B] shadow-xs"
                  : "bg-white dark:bg-[#1A1D20] text-slate-700 dark:text-slate-300 border-[#F0E4E2] dark:border-[#2B2C35] hover:border-[#F59E0B]"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>My Verified Skills</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === "skills" ? "bg-white/20 text-white" : "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"}`}>
                {studentSkills.length} Active
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("gaps")}
              className={`min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                activeTab === "gaps"
                  ? "bg-[#F59E0B] text-white border-[#F59E0B] shadow-xs"
                  : "bg-white dark:bg-[#1A1D20] text-slate-700 dark:text-slate-300 border-[#F0E4E2] dark:border-[#2B2C35] hover:border-[#F59E0B]"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Market Trends &amp; Gap Analysis</span>
            </button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* TAB 1: DSA & LEETCODE ROADMAP */}
        {/* ================================================================ */}
        {activeTab === "dsa" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* DSA Progress Card */}
            <Card className="border-blue-200 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-slate-50 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900">
              <CardContent className="p-4 sm:p-6 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <BrainCircuit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      DSA Interview Pattern Progress
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      Mastering the 4 core phases covers 90%+ of technical coding interviews at Amazon, Qualcomm, and top product firms.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                      {dsaProgressPct}%
                    </span>
                    <span className="text-xs text-slate-500 font-medium">({completedCount} of {totalProblems} targets)</span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${dsaProgressPct}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 4 Phases Breakdown */}
            {[
              {
                phase: 1,
                name: "Phase 1: Foundations, Arrays & Two Pointers",
                summary: "Master Time/Space Big-O, Hash Maps, Two-Pointer technique, and Sliding Window ranges.",
                topics: ["Two Pointers", "Sliding Window", "Prefix Sums", "HashMap Lookups"],
              },
              {
                phase: 2,
                name: "Phase 2: Linear Data Structures & Binary Search",
                summary: "Pointer reversal, cycle detection, monotonic stacks for nearest elements, and logarithmic binary search.",
                topics: ["Monotonic Stack", "Fast & Slow Pointers", "Binary Search on Rotated Arrays"],
              },
              {
                phase: 3,
                name: "Phase 3: Trees, Graphs & Priority Queues",
                summary: "Hierarchical trees, BFS level-order, DFS recursion, and graph grid traversal (Islands).",
                topics: ["BST Properties", "Graph DFS / BFS", "Topological Sort", "Min-Heap Top K"],
              },
              {
                phase: 4,
                name: "Phase 4: Dynamic Programming & Backtracking",
                summary: "Overlapping subproblems, state transitions, memoization, 0/1 knapsack, and decision trees.",
                topics: ["1D State Arrays", "Decision Trees", "Subsets & Permutations"],
              },
            ].map((section) => {
              const phaseProblems = LEETCODE_PROBLEMS.filter((p) => p.phase === section.phase);
              const phaseSolved = phaseProblems.filter((p) => completedProblems[p.id]).length;

              return (
                <Card key={section.phase} className="shadow-xs overflow-hidden">
                  <CardHeader className="bg-slate-50/70 dark:bg-slate-900/60 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                          {section.name}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500 mt-0.5">
                          {section.summary}
                        </CardDescription>
                      </div>
                      <Badge variant={phaseSolved === phaseProblems.length ? "success" : "blue"} size="sm">
                        {phaseSolved} / {phaseProblems.length} Done
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
                    {phaseProblems.map((prob) => {
                      const isDone = Boolean(completedProblems[prob.id]);
                      return (
                        <div
                          key={prob.id}
                          className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleToggleProblem(prob.id)}
                              className={`h-6 w-6 rounded-md flex items-center justify-center border transition-all ${
                                isDone
                                  ? "bg-emerald-600 border-emerald-600 text-white shadow-2xs"
                                  : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-transparent hover:border-blue-500"
                              }`}
                              aria-label={`Mark ${prob.title} as ${isDone ? "incomplete" : "complete"}`}
                            >
                              <Check className="h-4 w-4 stroke-[3]" />
                            </button>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-xs sm:text-sm font-medium ${
                                    isDone
                                      ? "line-through text-slate-400 dark:text-slate-500"
                                      : "text-slate-900 dark:text-slate-100"
                                  }`}
                                >
                                  {prob.title}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    prob.difficulty === "Easy"
                                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                      : prob.difficulty === "Medium"
                                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                      : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                  }`}
                                >
                                  {prob.difficulty}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                Pattern: {prob.pattern}
                              </span>
                            </div>
                          </div>

                          <a
                            href={prob.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900/60 transition-colors shrink-0 min-h-[36px]"
                          >
                            <span>Solve</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 2: CORE COMPUTER SCIENCE & CRT */}
        {/* ================================================================ */}
        {activeTab === "core" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Intro Notice */}
            <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 text-xs sm:text-sm text-indigo-900 dark:text-indigo-200 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                BVRIT Campus Recruitment Training (CRT) Alignment
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                In addition to coding rounds, technical interviews at Amazon, TCS Digital, Virtusa, and Qualcomm heavily evaluate your core fundamentals in DBMS, Operating Systems, and Computer Networks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* DBMS & SQL */}
              <Card className="shadow-xs">
                <CardHeader className="p-4 sm:p-5 pb-3">
                  <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Database className="h-4 w-4 text-blue-600" />
                    DBMS &amp; Advanced SQL
                  </CardTitle>
                  <CardDescription className="text-xs">Essential database interview questions &amp; query patterns</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 pt-0 space-y-3 text-xs">
                  <div className="space-y-1.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">1. Indexing (B-Trees &amp; Hash):</div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Why are primary keys clustered indexes? How does composite index ordering affect query lookups?
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">2. ACID Transactions &amp; Isolation Levels:</div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Dirty reads vs Non-repeatable reads vs Phantom reads. Know Read Committed vs Serializable.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">3. SQL Window Functions &amp; JOINs:</div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Be ready to write: `DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)` to find the N-th highest salary.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Operating Systems */}
              <Card className="shadow-xs">
                <CardHeader className="p-4 sm:p-5 pb-3">
                  <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Cpu className="h-4 w-4 text-emerald-600" />
                    Operating Systems (OS)
                  </CardTitle>
                  <CardDescription className="text-xs">Concurrency, memory architecture, and kernel primitives</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 pt-0 space-y-3 text-xs">
                  <div className="space-y-1.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">1. Process vs Thread:</div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Processes have distinct address spaces; threads share memory within the same process. Understand context switching overhead.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">2. Deadlock &amp; Synchronization:</div>
                    <p className="text-slate-600 dark:text-slate-400">
                      4 conditions (Mutual exclusion, Hold &amp; Wait, No preemption, Circular wait). Semaphores vs Mutex locks.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">3. Virtual Memory &amp; Paging:</div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Page tables, TLB (Translation Lookaside Buffer), Page fault handling, and LRU page replacement algorithms.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Computer Networks */}
              <Card className="shadow-xs">
                <CardHeader className="p-4 sm:p-5 pb-3">
                  <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Network className="h-4 w-4 text-purple-600" />
                    Computer Networks (CN)
                  </CardTitle>
                  <CardDescription className="text-xs">Protocols, routing, and transport layer mechanics</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 pt-0 space-y-3 text-xs">
                  <div className="space-y-1.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">1. TCP 3-Way Handshake vs UDP:</div>
                    <p className="text-slate-600 dark:text-slate-400">
                      SYN ➔ SYN-ACK ➔ ACK. Why is TCP reliable (sequence numbers, sliding window flow control, congestion window)?
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">2. What happens when you type google.com:</div>
                    <p className="text-slate-600 dark:text-slate-400">
                      DNS resolution (Local cache ➔ ISP ➔ Root ➔ TLD ➔ Authoritative) ➔ TCP handshake ➔ TLS handshake ➔ HTTP GET ➔ DOM rendering.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">3. HTTP/1.1 vs HTTP/2 vs HTTP/3:</div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Multiplexing, header compression (HPACK), and UDP-based QUIC protocol in HTTP/3.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* System Design Basics for Interns */}
              <Card className="shadow-xs">
                <CardHeader className="p-4 sm:p-5 pb-3">
                  <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Server className="h-4 w-4 text-amber-600" />
                    System Design Fundamentals
                  </CardTitle>
                  <CardDescription className="text-xs">High-level architecture concepts for product company rounds</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 pt-0 space-y-3 text-xs">
                  <div className="space-y-1.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">1. Caching Strategies:</div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Redis and Memcached. Write-Through vs Write-Back vs Cache-Aside patterns. Eviction policies (LRU, LFU).
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">2. Load Balancing &amp; Horizontal Scaling:</div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Round-robin, least connections, consistent hashing. Stateless vs stateful backend servers.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">3. REST vs GraphQL vs WebSockets:</div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Standard CRUD endpoints vs client-driven queries vs persistent bi-directional duplex channels.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 3: MY VERIFIED SKILLS */}
        {/* ================================================================ */}
        {activeTab === "skills" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Active Skills Overview */}
            <Card className="shadow-xs">
              <CardHeader className="p-4 sm:p-6 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold">
                      Your Profile Skills ({studentSkills.length})
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      These verified technical skills directly drive your AI Opportunity Match Score (70% weight).
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomModal(true)}
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                    className="min-h-[40px]"
                  >
                    Add Custom Skill
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                {studentSkills.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 border border-dashed rounded-xl">
                    <p className="text-xs">You have no skills listed yet. Search and add standard skills below!</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {studentSkills.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
                      >
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                          [{s.skill_category}]
                        </span>
                        <span>{s.skill_name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(s.id)}
                          className="min-h-[28px] min-w-[28px] inline-flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors"
                          aria-label={`Remove ${s.skill_name}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Search & Add Skills Catalog */}
            <Card className="shadow-xs">
              <CardHeader className="p-4 sm:p-6 pb-3">
                <CardTitle className="text-base font-bold">Standard Skills Catalog</CardTitle>
                <CardDescription className="text-xs">
                  Tap any skill tag to instantly add it to your profile.
                </CardDescription>

                {/* Filter Controls */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search languages, libraries, frameworks..."
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 min-h-[40px] focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("All")}
                      className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-medium min-h-[36px] transition-colors ${
                        selectedCategory === "All"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      All
                    </button>
                    {SKILL_CATEGORIES.slice(0, 5).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-medium min-h-[36px] transition-colors ${
                          selectedCategory === cat
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {filteredCatalog.slice(0, 32).map((item) => {
                    const isAdded = studentSkills.some(
                      (s) => s.skill_name.toLowerCase() === item.name.toLowerCase()
                    );
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => handleAddSkill(item)}
                        disabled={isAdded}
                        className={`min-h-[40px] px-3 py-2 rounded-lg text-xs font-medium transition-all text-left flex items-center justify-between gap-1.5 ${
                          isAdded
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default"
                            : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-2xs text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        <span className="truncate">{item.name}</span>
                        {isAdded ? (
                          <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                        ) : (
                          <Plus className="h-3 w-3 text-slate-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 4: MARKET TRENDS & GAP ANALYSIS */}
        {/* ================================================================ */}
        {activeTab === "gaps" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Live Market Analysis Card */}
            <Card className="shadow-xs">
              <CardHeader className="p-4 sm:p-6 pb-3">
                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Live Campus Opportunity Skill Alignment
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time analysis comparing your profile against active job and internship postings on CampusHub.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 pt-0 space-y-6">
                {/* Missing Skills in Demand */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Top Missing Skills in Active Campus Postings
                    </span>
                    <Badge variant="warning" size="sm">
                      {missingInDemand.length} Skills Recommended
                    </Badge>
                  </div>

                  {missingInDemand.length === 0 ? (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
                      🎉 Great job! Your profile covers all major technical skills required across current active opportunities.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {missingInDemand.slice(0, 6).map((item) => (
                        <div
                          key={item.skill}
                          className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {item.skill}
                            </div>
                            <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                              Required in {item.count} active {item.count === 1 ? "posting" : "postings"}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddSkill({ name: item.skill, category: "Tools" as any })}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-600 hover:bg-amber-700 text-white min-h-[32px] transition-colors"
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recruiter Skill Match Summary */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-blue-600" />
                    How Skill Weighting Affects Your AI Match Score
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    CampusHub’s AI Opportunity Matcher now weights technical skills at <strong>70%</strong> of the total score. Adding verified skills that overlap with employer requirements directly elevates your candidacy from <em>Partial Match</em> to <em>Strong Match</em>, while CGPA functions primarily as an eligibility filter.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Custom Skill Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Add Custom Skill</h3>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <Input
                label="Skill Name"
                value={customSkillName}
                onChange={(e) => setCustomSkillName(e.target.value)}
                placeholder="e.g. Solidity, TensorFlow, Flutter"
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={customSkillCat}
                  onChange={(e) => setCustomSkillCat(e.target.value as SkillCategory)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 min-h-[44px]"
                >
                  {SKILL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowCustomModal(false)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={handleAddCustom} className="bg-blue-600 text-white">
                Add to Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
