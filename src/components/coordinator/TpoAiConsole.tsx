"use client";

import * as React from "react";
import { Sparkles, Send, Bot, User, Check, Copy, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { queryTpoAiAssistantAction } from "@/lib/tpo/actions";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

const QUICK_TPO_QUERIES = [
  "Overview of placement operations",
  "Which drives have deadlines this week?",
  "Status of Amazon placement drive",
  "Show active interviews and assessments",
  "Status of JPMorgan Chase & Co.",
];

export function TpoAiConsole() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "initial",
      sender: "assistant",
      text: `### 🎓 CampusHub TPO Placement Intelligence\n\nWelcome! I provide real-time analytical queries across on-campus placement drives, candidate shortlisting stages, and section turnout rates.\n\nClick any suggested query below or type your question:`,
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleSend = async (queryText?: string) => {
    const queryToSend = queryText || input.trim();
    if (!queryToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: queryToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await queryTpoAiAssistantAction(queryToSend);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "assistant",
          text: "An error occurred while fetching placement intelligence. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Quick Queries */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {QUICK_TPO_QUERIES.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#1B1C22] hover:border-[#F59E0B] hover:text-[#F59E0B] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="h-3 w-3 text-[#F59E0B]" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Chat Thread */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[440px]">
        <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto max-h-[520px]">
          {messages.map((msg) => {
            const isBot = msg.sender === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isBot ? "justify-start" : "justify-end"}`}
              >
                {isBot && (
                  <div className="h-8 w-8 rounded-xl bg-[#FFF0EE] dark:bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div className={`space-y-1 max-w-[85%] ${isBot ? "" : "items-end"}`}>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1">
                    <span className="font-semibold">{isBot ? "TPO Placement AI" : "Coordinator"}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      isBot
                        ? "bg-slate-50 dark:bg-[#1B1C22] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs whitespace-pre-wrap font-sans"
                        : "bg-[#F59E0B] text-white rounded-tr-xs"
                    }`}
                  >
                    {msg.text}

                    {isBot && (
                      <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Grounded from verified campus placement records</span>
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="inline-flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-500" />
                              <span className="text-emerald-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-400 italic">
              <div className="h-6 w-6 rounded-lg bg-[#FFF0EE] text-[#F59E0B] flex items-center justify-center animate-pulse">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <span>Querying placement records across 27 sections...</span>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1B1C22]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about active drives, shortlists, interview rounds, or turnouts..."
              className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#23242B] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
