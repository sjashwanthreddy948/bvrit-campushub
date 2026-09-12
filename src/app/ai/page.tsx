"use client";

import * as React from "react";
import {
  Send,
  User,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  Plus,
  ChevronLeft,
  Menu,
  Code2,
  BookOpen,
  Briefcase,
  Calendar,
  FileText,
  Zap,
  Globe,
  GraduationCap,
  MessageSquare,
  StopCircle,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { cn } from "@/lib/utils";
import { getPersonalAiInitialGreeting } from "@/lib/personal-ai/actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  isStreaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

// ─── Suggested Prompts ────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  { label: "Explain Binary Search with code", icon: Code2, color: "text-amber-500" },
  { label: "Which placement opportunities suit me?", icon: Briefcase, color: "text-teal-500" },
  { label: "What assignments are due soon?", icon: Calendar, color: "text-blue-500" },
  { label: "Write a cold email to a recruiter", icon: FileText, color: "text-purple-500" },
  { label: "What is machine learning?", icon: Globe, color: "text-amber-500" },
  { label: "How to prepare for TCS NQT?", icon: GraduationCap, color: "text-teal-500" },
  { label: "Solve: Two Sum problem (LeetCode)", icon: Code2, color: "text-blue-500" },
  { label: "Explain System Design basics", icon: Zap, color: "text-purple-500" },
];

// ─── Markdown / Code Renderer ─────────────────────────────────────────────────

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-700/60 bg-[#0D1117] shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-[#161B22] border-b border-slate-700/60">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">{lang || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="text-slate-100 font-mono">{code}</code>
      </pre>
    </div>
  );
}

function MarkdownMessage({ content }: { content: string }) {
  // Split by fenced code blocks first
  const segments = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-100">
      {segments.map((seg, idx) => {
        if (seg.startsWith("```")) {
          const lines = seg.slice(3).split("\n");
          const lang = lines[0].trim();
          const code = lines.slice(1, -1).join("\n");
          return <CodeBlock key={idx} code={code} lang={lang} />;
        }
        // Render inline markdown
        return <InlineMarkdown key={idx} text={seg} />;
      })}
    </div>
  );
}

function InlineMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");

  const renderInline = (raw: string): React.ReactNode => {
    // Handle bold, italic, inline code
    const parts = raw.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((p, i) => {
      if (p.startsWith("`") && p.endsWith("`"))
        return <code key={i} className="bg-slate-700/60 border border-slate-600/40 px-1.5 py-0.5 rounded text-[12px] font-mono text-amber-300">{p.slice(1,-1)}</code>;
      if (p.startsWith("**") && p.endsWith("**"))
        return <strong key={i} className="font-bold text-white">{p.slice(2,-2)}</strong>;
      if (p.startsWith("*") && p.endsWith("*"))
        return <em key={i} className="italic text-slate-300">{p.slice(1,-1)}</em>;
      return p;
    });
  };

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith("### "))
          return <h3 key={idx} className="text-base font-bold text-white mt-3 mb-1 pb-1 border-b border-slate-700/50">{renderInline(trimmed.slice(4))}</h3>;
        if (trimmed.startsWith("## "))
          return <h2 key={idx} className="text-lg font-extrabold text-white mt-3 mb-1">{renderInline(trimmed.slice(3))}</h2>;
        if (trimmed.startsWith("# "))
          return <h1 key={idx} className="text-xl font-extrabold text-amber-400 mt-2 mb-1">{renderInline(trimmed.slice(2))}</h1>;

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-amber-400 font-bold mt-0.5 shrink-0">•</span>
              <span>{renderInline(trimmed.slice(2))}</span>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch)
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1">
              <span className="text-amber-400 font-bold shrink-0 min-w-[1.2rem]">{numMatch[1]}.</span>
              <span>{renderInline(numMatch[2])}</span>
            </div>
          );

        if (trimmed.startsWith("> "))
          return (
            <div key={idx} className="border-l-4 border-amber-500/60 pl-3 py-1 my-1 text-slate-300 italic text-[13px] bg-amber-500/5 rounded-r">
              {renderInline(trimmed.slice(2))}
            </div>
          );

        return <p key={idx} className="text-slate-200">{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

// ─── Thinking & Reasoning Indicator ──────────────────────────────────────────

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-3 py-1 text-xs text-amber-300/90 select-none animate-in fade-in duration-150">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-amber-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 font-bold tracking-wide">
        <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin" />
        <span>Thinking &amp; analyzing question...</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CampusHubAIPage() {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = React.useState<string | null>(null);
  const [input, setInput] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [studentInfo, setStudentInfo] = React.useState({ name: "Student", department: "CSE", year: 3 });
  const [apiKeyMissing, setApiKeyMissing] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId) || null;
  const messages = activeConv?.messages || [];

  // Auto-scroll
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Load student info
  React.useEffect(() => {
    getPersonalAiInitialGreeting().then((d) => {
      setStudentInfo({ name: d.studentName, department: d.department, year: d.year });
    }).catch(() => {});
  }, []);

  const createNewConversation = () => {
    const id = `conv-${Date.now()}`;
    const conv: Conversation = {
      id,
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveConvId(id);
    setSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText || isStreaming) return;

    // Create conversation if none
    let convId = activeConvId;
    if (!convId) {
      const id = `conv-${Date.now()}`;
      const conv: Conversation = {
        id,
        title: msgText.slice(0, 40),
        messages: [],
        createdAt: new Date().toISOString(),
      };
      setConversations((prev) => [conv, ...prev]);
      setActiveConvId(id);
      convId = id;
    }

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text: msgText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Add user message and placeholder assistant message
    const assistantMsgId = `a-${Date.now()}`;
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isStreaming: true,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              title: c.messages.length === 0 ? msgText.slice(0, 45) : c.title,
              messages: [...c.messages, userMsg, assistantMsg],
            }
          : c
      )
    );
    setInput("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    // Build history for context
    const currentConv = conversations.find((c) => c.id === convId);
    const history = (currentConv?.messages || []).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      text: m.text,
    }));

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msgText, history }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("API error");
      if (!res.body) throw new Error("No stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, text: accumulated, isStreaming: true }
                      : m
                  ),
                }
              : c
          )
        );
      }

      // Mark streaming done
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, isStreaming: false }
                    : m
                ),
              }
            : c
        )
      );

      // Detect if API key is missing from response
      if (accumulated.includes("GEMINI_API_KEY")) {
        setApiKeyMissing(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // User stopped — mark done
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId ? { ...m, isStreaming: false } : m
                  ),
                }
              : c
          )
        );
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          text: "⚠️ Something went wrong. Please check your connection and try again.",
                          isStreaming: false,
                        }
                      : m
                  ),
                }
              : c
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const stopStreaming = () => {
    abortRef.current?.abort();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  return (
    <DashboardShell role="student" userName={studentInfo.name}>
      <div className="flex h-[calc(100vh-4rem)] -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl bg-[#0F1117]">

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside
          className={cn(
            "flex flex-col w-64 bg-[#111318] border-r border-slate-800/60 shrink-0 transition-all duration-300 z-20",
            "absolute inset-y-0 left-0 lg:relative lg:translate-x-0",
            sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* Sidebar Header */}
          <div className="p-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white text-sm">CampusHub AI</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-auto lg:hidden text-slate-400 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={createNewConversation}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 hover:text-amber-300 transition-all text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6 px-3">
                Your conversations will appear here
              </p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => { setActiveConvId(conv.id); setSidebarOpen(false); }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all truncate",
                    conv.id === activeConvId
                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{conv.title}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Student info */}
          <div className="p-3 border-t border-slate-800/60">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="h-7 w-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <User className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-300 truncate">{studentInfo.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{studentInfo.department} · Y{studentInfo.year}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Main Chat Area ─────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* Top bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/60 bg-[#111318] shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-sm">CampusHub AI</span>
                <span className="text-[10px] text-amber-400/80 font-semibold ml-2">Powered by Gemini Reasoning Engine</span>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {activeConv && (
                <button
                  onClick={() => {
                    setConversations((prev) => prev.map((c) =>
                      c.id === activeConvId ? { ...c, messages: [] } : c
                    ));
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-slate-800/60 transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* API Key Banner */}
          {apiKeyMissing && (
            <div className="mx-4 mt-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
              <Zap className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Unlock full AI power:</span> Add your free Gemini API key to{" "}
                <code className="bg-amber-900/30 px-1 rounded">.env.local</code> as{" "}
                <code className="bg-amber-900/30 px-1 rounded">GEMINI_API_KEY=your_key</code>.
                Get a free key at{" "}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline">
                  aistudio.google.com/apikey
                </a>
              </div>
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              /* Welcome / Empty State */
              <div className="flex flex-col items-center justify-center h-full px-4 py-8 text-center max-w-2xl mx-auto">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                  How can I help you today?
                </h1>
                <p className="text-slate-400 text-sm mb-8 max-w-md">
                  I can answer <strong className="text-slate-200">anything</strong> — coding, placements, general knowledge, campus info, math, writing, and more.
                </p>

                {/* Prompt grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl">
                  {SUGGESTED_PROMPTS.map((p, i) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => sendMessage(p.label)}
                        className="flex items-center gap-3 p-3.5 rounded-xl bg-[#1A1D27] hover:bg-[#1F2330] border border-slate-700/50 hover:border-amber-500/30 text-left transition-all group text-sm text-slate-300 hover:text-white"
                      >
                        <Icon className={cn("h-4 w-4 shrink-0", p.color)} />
                        <span className="leading-snug">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Message list */
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 mt-1 shadow-md shadow-amber-500/20">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    )}

                    <div className={cn("max-w-[85%] sm:max-w-[78%] space-y-1.5", msg.role === "user" && "items-end")}>
                      {msg.role === "user" ? (
                        <div className="bg-amber-500 text-slate-950 px-4 py-3 rounded-2xl rounded-tr-sm text-sm font-medium leading-relaxed shadow-md shadow-amber-500/20">
                          {msg.text}
                        </div>
                      ) : (
                        <div className="bg-[#1A1D27] border border-slate-700/50 px-5 py-4 rounded-2xl rounded-tl-sm shadow-md">
                          {msg.isStreaming && !msg.text ? (
                            <ThinkingIndicator />
                          ) : (
                            <MarkdownMessage content={msg.text} />
                          )}
                          {msg.isStreaming && msg.text && (
                            <span className="inline-block w-0.5 h-4 bg-amber-400 animate-pulse ml-0.5 align-middle" />
                          )}
                        </div>
                      )}

                      {/* Message footer */}
                      {!msg.isStreaming && (
                        <div className={cn(
                          "flex items-center gap-2 px-1 text-[10px] text-slate-500",
                          msg.role === "user" ? "justify-end" : "justify-start"
                        )}>
                          <span>{msg.timestamp}</span>
                          {msg.role === "assistant" && (
                            <button
                              onClick={() => handleCopyMessage(msg.text)}
                              className="hover:text-slate-300 transition-colors flex items-center gap-0.5"
                            >
                              <Copy className="h-3 w-3" />
                              Copy
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {msg.role === "user" && (
                      <div className="h-8 w-8 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                        <User className="h-4 w-4 text-slate-300" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ── Input Area ─────────────────────────────────────────────────── */}
          <div className="shrink-0 border-t border-slate-800/60 bg-[#111318] px-4 py-3 sm:px-6">
            <div className="max-w-3xl mx-auto">
              <div className="relative flex items-end gap-2 bg-[#1A1D27] border border-slate-700/60 rounded-2xl px-4 py-3 focus-within:border-amber-500/50 transition-all shadow-lg">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything — coding, placement, general knowledge, campus info..."
                  rows={1}
                  disabled={isStreaming}
                  className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 text-sm resize-none focus:outline-none min-h-[24px] max-h-[200px] leading-relaxed disabled:opacity-60"
                  style={{ height: "auto" }}
                />
                <div className="flex items-center gap-2 shrink-0 pb-0.5">
                  {isStreaming ? (
                    <button
                      onClick={stopStreaming}
                      className="h-9 w-9 rounded-xl bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-all"
                      title="Stop generating"
                    >
                      <StopCircle className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => sendMessage()}
                      disabled={!input.trim()}
                      className="h-9 w-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-amber-500/20"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-center text-[10px] text-slate-600 mt-2">
                Enter to send • Shift+Enter for new line • Powered by Gemini 2.0 Flash
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
