"use client";

import * as React from "react";
import { Sparkles, Send, Bot, User, RotateCcw, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { answerOpportunityQuestion } from "@/lib/matching/assistant";
import { QUICK_QUESTIONS } from "@/lib/matching/constants";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

interface AskAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityId: string;
  opportunityTitle: string;
  company: string;
}

export function AskAiModal({
  isOpen,
  onClose,
  opportunityId,
  opportunityTitle,
  company,
}: AskAiModalProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "initial",
      sender: "assistant",
      text: `Hello! I am your CampusHub AI Assistant for **${opportunityTitle}** at **${company}**.\n\nI answer questions grounded strictly in official opportunity details and your authorized profile. Tap any question below or type your own.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputQuestion, setInputQuestion] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, messages]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputQuestion).trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion("");
    setLoading(true);

    try {
      const res = await answerOpportunityQuestion(opportunityId, q);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        text: "Unable to process question. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "initial",
        sender: "assistant",
        text: `Hello! I am your CampusHub AI Assistant for **${opportunityTitle}** at **${company}**.\n\nI answer questions grounded strictly in official opportunity details and your authorized profile. Tap any question below or type your own.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ask CampusHub AI"
      description={`${opportunityTitle} • ${company}`}
      size="lg"
      footer={
        <div className="w-full flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-slate-500 min-h-[44px]"
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Clear Chat
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="min-h-[44px]"
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="flex flex-col h-[65vh] sm:h-[480px] -mx-4 sm:-mx-6 -my-4 sm:-my-6">
        {/* Quick Question Action Chips */}
        <div className="p-3 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Suggested Questions:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                disabled={loading}
                className="min-h-[36px] px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 leading-relaxed break-words ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 rounded-bl-xs"
                }`}
              >
                <div className="whitespace-pre-line space-y-1">
                  {msg.text.split("\n\n").map((para, i) => (
                    <p key={i} className={para.startsWith("•") ? "pl-2" : ""}>
                      {para}
                    </p>
                  ))}
                </div>
                <span
                  className={`block text-[10px] mt-1.5 text-right ${
                    msg.sender === "user" ? "text-blue-200" : "text-slate-400"
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === "user" && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-bl-xs flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1 font-medium">Analyzing verified facts...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask a question about this opportunity..."
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden min-h-[44px]"
            />
            <button
              type="submit"
              disabled={loading || !inputQuestion.trim()}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white flex items-center justify-center transition-colors shrink-0"
              aria-label="Send question"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <span className="text-[10px] text-slate-400 block text-center mt-1.5">
            CampusHub AI uses official opportunity facts and your profile. It never guarantees selection.
          </span>
        </div>
      </div>
    </Modal>
  );
}
