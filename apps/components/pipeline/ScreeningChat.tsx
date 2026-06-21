"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader } from "lucide-react";
import { api } from "@/lib/api/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Props {
  candidateId: string;
  candidateName: string;
}

export default function ScreeningChat({ candidateId, candidateName }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi ${candidateName}, I'm the TryB3 Screening Agent. I'll be asking you a few questions about your experience. Let's start — can you tell me about your most recent role?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [memoriesCount, setMemoriesCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const result = await api.sendScreeningMessage(candidateId, input.trim());

      const agentMessage: Message = {
        role: "assistant",
        content: result.reply,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, agentMessage]);
      setMemoriesCount(result.memoriesCount);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "I encountered an issue. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] rounded-xl border border-border-main
                    bg-bg-card overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3
                      border-b border-border-main bg-bg-secondary">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20
                          flex items-center justify-center">
            <Bot size={14} color="#10B981" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              Screening Agent
            </p>
            <p className="mono text-xs text-text-muted">
              Powered by Qwen-Plus
            </p>
          </div>
        </div>

        {memoriesCount > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md
                          bg-col-violet/10 border border-col-violet/20">
            <span className="mono text-xs text-col-violet">
              {memoriesCount} memories stored
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center
                           flex-shrink-0 border"
                style={{
                  backgroundColor:
                    msg.role === "assistant"
                      ? "rgba(16,185,129,0.1)"
                      : "rgba(99,102,241,0.1)",
                  borderColor:
                    msg.role === "assistant"
                      ? "rgba(16,185,129,0.2)"
                      : "rgba(99,102,241,0.2)",
                }}
              >
                {msg.role === "assistant"
                  ? <Bot size={13} color="#10B981" />
                  : <User size={13} color="#6366F1" />
                }
              </div>

              {/* Bubble */}
              <div
                className="max-w-[75%] rounded-xl px-4 py-3"
                style={{
                  backgroundColor:
                    msg.role === "assistant"
                      ? "var(--color-bg-secondary)"
                      : "rgba(99,102,241,0.12)",
                  borderRadius:
                    msg.role === "assistant"
                      ? "4px 12px 12px 12px"
                      : "12px 4px 12px 12px",
                }}
              >
                <p className="text-sm text-text-primary leading-relaxed">
                  {msg.content}
                </p>
                <p className="mono text-[10px] text-text-muted mt-1.5">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20
                            flex items-center justify-center flex-shrink-0">
              <Bot size={13} color="#10B981" />
            </div>
            <div className="px-4 py-3 rounded-xl bg-bg-secondary flex items-center gap-1.5">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-text-muted"
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border-main bg-bg-secondary">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Type your response..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-border-main
                       bg-bg-card text-text-primary text-sm outline-none
                       placeholder:text-text-muted focus:border-accent
                       transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-accent flex items-center
                       justify-center border-0 cursor-pointer
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading
              ? <Loader size={14} color="#fff" className="animate-spin" />
              : <Send size={14} color="#fff" />
            }
          </motion.button>
        </div>
        <p className="mono text-[10px] text-text-muted mt-2 text-center">
          Responses powered by Qwen-Plus · memories persist across sessions
        </p>
      </div>
    </div>
  );
}