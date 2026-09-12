"use client";

import * as React from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  Copy,
  Check,
  Building2,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  Briefcase,
  Bus,
  Home,
  FileCheck,
  Lightbulb,
  BookOpen,
  PhoneCall,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { askCampusAi } from "@/lib/campus-ai/actions";
import { BVRIT_QUICK_CATEGORIES, BVRIT_INSTITUTION_PROFILE } from "@/lib/campus-ai/knowledge";

export interface CampusAiMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  category?: string;
  sourceTopics?: string[];
  suggestedFollowUps?: string[];
  timestamp: string;
}

interface CampusAiChatProps {
  compact?: boolean;
  initialQuestion?: string;
  onNavigateCategory?: (categoryId: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  academics: <GraduationCap className="h-3.5 w-3.5" />,
  placements: <Briefcase className="h-3.5 w-3.5" />,
  transport: <Bus className="h-3.5 w-3.5" />,
  hostels: <Home className="h-3.5 w-3.5" />,
  exams: <FileCheck className="h-3.5 w-3.5" />,
  innovation: <Lightbulb className="h-3.5 w-3.5" />,
  library: <BookOpen className="h-3.5 w-3.5" />,
  contacts: <PhoneCall className="h-3.5 w-3.5" />,
  circulars: <FileText className="h-3.5 w-3.5" />,
  opportunities: <Briefcase className="h-3.5 w-3.5" />,
  assignments: <BookOpen className="h-3.5 w-3.5" />,
  digest: <Sparkles className="h-3.5 w-3.5" />,
};

function renderFormattedText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const label = match[1];
    const url = match[2];
    const isExternal = url.startsWith("http");
    parts.push(
      <a
        key={match.index}
        href={url}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-700 inline-flex items-center gap-0.5"
      >
        <span>{label}</span>
        {isExternal && <ExternalLink className="h-3 w-3 inline" />}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

export function CampusAiChat({
  compact = false,
  initialQuestion,
}: CampusAiChatProps) {
  const [messages, setMessages] = React.useState<CampusAiMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: `### Welcome to CampusHub AI — BVRIT Narsapur Intelligence!\n\nI am your verified institutional assistant for **B.V. Raju Institute of Technology (BVRIT), Narsapur**.\n\nAsk me anything about **Academics & Departments, Autonomous Exam Regulations, Placements, College Bus Routes, Hostels & Dining, AIC-BVRIT Incubation**, or **Emergency Contacts**.\n\nTap any suggested topic or question below to get started!`,
      category: "Welcome",
      sourceTopics: ["BVRIT Narsapur Knowledge Base"],
      suggestedFollowUps: [
        "What are the top placement records?",
        "Show college bus routes to Kukatpally",
        "What is the 75% attendance rule?",
        "Tell me about the CSE Department",
        "What are the hostel facilities?",
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputQuestion, setInputQuestion] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [copiedMsgId, setCopiedMsgId] = React.useState<string | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle optional initial question
  React.useEffect(() => {
    if (initialQuestion) {
      handleSend(initialQuestion);
    }
  }, [initialQuestion]);

  const handleSend = async (questionToSend?: string) => {
    const q = (questionToSend || inputQuestion).trim();
    if (!q || loading) return;

    const userMsg: CampusAiMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion("");
    setLoading(true);

    try {
      const res = await askCampusAi(q);
      const assistantMsg: CampusAiMessage = {
        id: `ast-${Date.now()}`,
        sender: "assistant",
        text: res.answer,
        category: res.category,
        sourceTopics: res.sourceTopics,
        suggestedFollowUps: res.suggestedFollowUps,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: CampusAiMessage = {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: "I'm having trouble connecting to the BVRIT campus intelligence engine. Please try asking again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome-fresh",
        sender: "assistant",
        text: `Chat cleared. What would you like to know about **BVRIT Narsapur**?`,
        category: "Fresh Session",
        suggestedFollowUps: [
          "Tell me about BVRIT placements",
          "Show college bus routes",
          "What are the hostel facilities?",
          "How to submit assignments on Vedic.ai?",
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Get active follow-ups from the most recent assistant message
  const lastAssistantMsg = [...messages].reverse().find((m) => m.sender === "assistant");
  const activeFollowUps = lastAssistantMsg?.suggestedFollowUps || [];

  return (
    <div
      className={`flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${
        compact ? "h-[560px]" : "h-[720px] max-h-[85vh]"
      }`}
    >
      {/* 1. Header with BVRIT Branding */}
      <div className="p-3.5 sm:p-4 bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                CampusHub AI
              </h2>
              <Badge variant="blue" className="text-[10px] px-1.5 py-0.5">
                BVRIT Narsapur
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Autonomous JNTUH • NAAC A+ • NBA Tier-I
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetChat}
            className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 min-h-[36px]"
            title="Reset Chat"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </div>

      {/* 2. Category Selection Pills */}
      <div className="p-2 sm:px-3 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200/70 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`min-h-[32px] px-2.5 py-1 rounded-full text-xs font-medium transition-colors shrink-0 whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400"
            }`}
          >
            All Topics
          </button>
          {BVRIT_QUICK_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                if (cat.sampleQueries.length > 0) {
                  handleSend(cat.sampleQueries[0]);
                }
              }}
              className={`min-h-[32px] px-2.5 py-1 rounded-full text-xs font-medium transition-colors shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400"
              }`}
            >
              {CATEGORY_ICONS[cat.id]}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Chat Message Stream */}
      <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "assistant" && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-[90%] sm:max-w-[82%] rounded-2xl p-3.5 sm:p-4 leading-relaxed break-words shadow-2xs ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-xs"
                  : "bg-slate-100/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/70 rounded-bl-xs"
              }`}
            >
              {/* Message Header for Assistant */}
              {msg.sender === "assistant" && (
                <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      BVRIT Campus Assistant
                    </span>
                    {msg.category && (
                      <span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded text-[10px]">
                        {msg.category}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(msg.id, msg.text)}
                    className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
                    title="Copy Answer"
                  >
                    {copiedMsgId === msg.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-[10px] text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span className="text-[10px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Formatted Text Content */}
              <div className="whitespace-pre-line space-y-1.5 leading-relaxed">
                {msg.text.split("\n\n").map((chunk, idx) => {
                  if (chunk.startsWith("### ")) {
                    return (
                      <h3
                        key={idx}
                        className="font-bold text-sm sm:text-base text-slate-900 dark:text-white pt-1"
                      >
                        {renderFormattedText(chunk.replace("### ", ""))}
                      </h3>
                    );
                  }
                  if (chunk.startsWith("#### ")) {
                    return (
                      <h4
                        key={idx}
                        className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 pt-0.5"
                      >
                        {renderFormattedText(chunk.replace("#### ", ""))}
                      </h4>
                    );
                  }
                  if (chunk.startsWith("|")) {
                    return (
                      <div key={idx} className="overflow-x-auto my-2">
                        <table className="min-w-full text-left text-xs border border-slate-200 dark:border-slate-700">
                          <tbody>
                            {chunk
                              .split("\n")
                              .filter((row) => !row.includes(":---") && row.trim().length > 0)
                              .map((row, rIdx) => (
                                <tr
                                  key={rIdx}
                                  className={
                                    rIdx === 0
                                      ? "bg-slate-200/60 dark:bg-slate-700/60 font-semibold"
                                      : "border-t border-slate-200 dark:border-slate-700"
                                  }
                                >
                                  {row
                                    .split("|")
                                    .filter((c) => c !== "")
                                    .map((cell, cIdx) => (
                                      <td key={cIdx} className="p-1.5 border-r border-slate-200 dark:border-slate-700">
                                        {renderFormattedText(cell.trim())}
                                      </td>
                                    ))}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                  return (
                    <p
                      key={idx}
                      className={
                        chunk.startsWith("•")
                          ? "pl-2.5 text-slate-700 dark:text-slate-300"
                          : ""
                      }
                    >
                      {renderFormattedText(chunk)}
                    </p>
                  );
                })}
              </div>

              {/* Source Topics Tags */}
              {msg.sourceTopics && msg.sourceTopics.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/50 flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Sources:</span>
                  {msg.sourceTopics.map((topic, tIdx) => (
                    <span
                      key={tIdx}
                      className="bg-slate-200/80 dark:bg-slate-700/70 px-1.5 py-0.5 rounded text-[10px] text-slate-700 dark:text-slate-300"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              <span
                className={`block text-[10px] mt-1 text-right ${
                  msg.sender === "user" ? "text-blue-200" : "text-slate-400"
                }`}
              >
                {msg.timestamp}
              </span>
            </div>

            {msg.sender === "user" && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {/* Thinking & Reasoning Indicator */}
        {loading && (
          <div className="flex items-start gap-2.5 justify-start animate-in fade-in duration-200">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800/90 rounded-2xl rounded-bl-xs p-3.5 border border-blue-200/70 dark:border-blue-800/50 flex items-center gap-3 shadow-xs">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                <span
                  className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-purple-600 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-spin" />
                  Thinking &amp; Reasoning...
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  CampusHub AI is formulating an accurate step-by-step answer...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Suggested Follow-Up Prompt Chips */}
      {activeFollowUps.length > 0 && !loading && (
        <div className="px-3.5 py-2 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Suggested Questions:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {activeFollowUps.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                className="min-h-[34px] px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Input Field Bar */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask about departments, placements, buses, hostels, exam rules..."
            disabled={loading}
            className="flex-1 min-h-[44px] px-3.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
          />

          <Button
            type="submit"
            disabled={!inputQuestion.trim() || loading}
            className="min-h-[44px] px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium shrink-0 rounded-xl"
            rightIcon={<Send className="h-4 w-4" />}
          >
            <span className="hidden sm:inline">Ask</span>
          </Button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
          <span>Grounded in official BVRIT Narsapur records.</span>
          <a
            href={BVRIT_INSTITUTION_PROFILE.officialWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center gap-0.5"
          >
            <span>bvrit.ac.in</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
