"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  MessageCircle,
  Loader2,
  Trash2,
} from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  "Explain a programming concept",
  "Prepare me for a technical interview",
  "How can I communicate with global teams?",
  "Help me improve my leadership skills",
];

export default function AiCoach() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isOpen]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();

    if (!content || loading) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in again to use the AI assistant.");
      return;
    }

    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content },
    ];

    setMessages(updatedMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5000/api";

      const response = await fetch(`${apiUrl}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: updatedMessages.slice(-8),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to contact the AI assistant."
        );
      }

      if (!data.reply) {
        throw new Error("The AI did not return a response.");
      }

      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([]);
    setError("");
    setInput("");
  }

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open CultureBridge AI Coach"
        className="fixed bottom-6 right-6 z-[100] flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 text-white shadow-2xl transition hover:scale-110"
      >
        {isOpen ? <X size={27} /> : <Bot size={29} />}

        {!isOpen && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[10px]">
            AI
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <section className="fixed bottom-24 right-4 z-[100] flex h-[min(620px,75vh)] w-[min(400px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl sm:right-6">
          
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-cyan-600 to-violet-700 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
                <Sparkles size={23} />
              </div>

              <div>
                <h3 className="font-bold">CultureBridge AI</h3>
                <p className="text-xs text-white/80">
                  Your personal learning coach
                </p>
              </div>
            </div>

            <button
              onClick={clearChat}
              title="Clear conversation"
              aria-label="Clear conversation"
              className="rounded-lg p-2 transition hover:bg-white/20"
            >
              <Trash2 size={19} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="py-5">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-500">
                  <MessageCircle size={32} />
                </div>

                <h4 className="mt-5 text-center text-lg font-bold text-[var(--text)]">
                  Hello, Learner!
                </h4>

                <p className="mt-2 text-center text-sm leading-6 text-[var(--muted)]">
                  I'm your AI learning coach. Ask me about engineering,
                  programming, interviews or professional development.
                </p>

                <div className="mt-6 space-y-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage(suggestion)}
                      disabled={loading}
                      className="w-full rounded-xl border border-[var(--border)] p-3 text-left text-sm text-[var(--text)] transition hover:border-cyan-400 hover:bg-cyan-400/10 disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "rounded-br-sm bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                      : "rounded-bl-sm border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <Loader2 size={18} className="animate-spin text-cyan-500" />
                CultureBridge AI is thinking...
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-500">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2 border-t border-[var(--border)] p-3"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask anything..."
              maxLength={1500}
              disabled={loading}
              className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-cyan-500"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={19} />
            </button>
          </form>

          <p className="pb-2 text-center text-[10px] text-[var(--muted)]">
            AI-generated answers may contain mistakes. Verify important information.
          </p>
        </section>
      )}
    </>
  );
}