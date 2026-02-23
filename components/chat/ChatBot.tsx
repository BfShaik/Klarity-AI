"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, X, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function ChatBot() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I'm your Klarity AI assistant. I can add achievements, work logs, and notes, or search your data. Try: \"Add a work log for today: Met with vendor about migration\" or \"Search for Oracle certification\"." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: text }].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");
      setMessages((prev) => [...prev, { role: "assistant", content: data.content || "" }]);
      router.refresh();
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${e instanceof Error ? e.message : "Something went wrong"}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        style={{ backgroundColor: "var(--accent-red)", color: "white" }}
        aria-label="Open chat"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[480px] flex flex-col rounded-xl shadow-2xl overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-dark)" }}
        >
          <div
            className="px-4 py-3 border-b flex items-center gap-2"
            style={{ borderColor: "var(--border-dark)" }}
          >
            <MessageCircle size={20} style={{ color: "var(--accent-red)" }} />
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Klarity Assistant
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: "var(--bg-main)" }}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "rounded-br-none"
                      : "rounded-bl-none"
                  }`}
                  style={{
                    backgroundColor: m.role === "user" ? "var(--accent-red)" : "var(--bg-panel)",
                    color: m.role === "user" ? "white" : "var(--text-primary)",
                  }}
                >
                  {m.role === "assistant" ? (
                    <div className="chat-message-content [&_ul]:my-1.5 [&_li]:my-0.5 [&_strong]:font-semibold [&_p]:mb-1 [&_p:last-child]:mb-0">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          br: () => <br />,
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div
                  className="rounded-lg rounded-bl-none px-3 py-2 text-sm text-slate-400"
                  style={{ backgroundColor: "var(--bg-panel)" }}
                >
                  Thinking...
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <div
            className="p-3 border-t flex gap-2"
            style={{ borderColor: "var(--border-dark)", backgroundColor: "var(--bg-card)" }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Add achievement, work log, note, or search..."
              className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-red)]"
              style={{
                backgroundColor: "var(--bg-main)",
                borderColor: "var(--border-dark)",
                color: "var(--text-primary)",
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="rounded-lg px-3 py-2 flex items-center gap-1 text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: "var(--accent-red)", color: "white" }}
            >
              <Send size={16} />
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
