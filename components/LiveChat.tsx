"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

type Message = {
  id: string;
  sender_type: string;
  sender_name?: string;
  content: string;
  created_at: number;
};

type Conversation = {
  id: string;
  status: string;
  subject: string;
  rating?: number | null;
};

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Rating state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingBusy, setRatingBusy] = useState(false);
  const [closeWarning, setCloseWarning] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Open a specific conversation when another part of the app requests it
  // (e.g. clicking a support request in the dashboard).
  useEffect(() => {
    function openChat(e: Event) {
      const detail = (e as CustomEvent<{ conversationId?: string }>).detail;
      if (!detail?.conversationId) return;
      setIsOpen(true);
      fetch(`/api/conversations/${detail.conversationId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { conversation?: Conversation; messages?: Message[] } | null) => {
          if (!data?.conversation) return;
          setConversation(data.conversation);
          setMessages(data.messages || []);
        })
        .catch(() => {});
    }
    window.addEventListener("invoala:open-chat", openChat);
    return () => window.removeEventListener("invoala:open-chat", openChat);
  }, []);

  // Auto-close warning: check if last support message was 5+ min ago
  useEffect(() => {
    if (!conversation || conversation.status === "resolved" || conversation.status === "ai") return;

    const interval = setInterval(() => {
      // Find last support/system message time
      const lastSupportMsg = [...messages].reverse().find(
        (m) => m.sender_type === "support" || m.sender_type === "system"
      );
      if (!lastSupportMsg) return;

      const elapsed = Date.now() - lastSupportMsg.created_at;
      const fiveMin = 5 * 60 * 1000;
      const tenMin = 10 * 60 * 1000;

      if (elapsed >= tenMin) {
        // Auto-resolve
        setCloseWarning(null);
        fetch(`/api/conversations/${conversation.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: "[Auto-closed due to inactivity]" }),
        }).catch(() => {});
        setConversation((prev) => prev ? { ...prev, status: "resolved" } : null);
      } else if (elapsed >= fiveMin) {
        setCloseWarning("This chat will close in a few minutes due to inactivity. Please reply to keep it open.");
      }
    }, 15000); // check every 15s

    return () => clearInterval(interval);
  }, [conversation?.id, conversation?.status, messages]);

  // Check if conversation is resolved and not yet rated
  const showRating =
    conversation?.status === "resolved" && !conversation.rating && !ratingSubmitted;

  const startConversation = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const content = message;
    setSending(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: "Support request", content }),
      });
      const data = await res.json();

      if (data.ok) {
        setConversation({ id: data.conversationId, status: data.escalated ? "escalated" : "ai", subject: "Support request" });
        setMessage("");

        const msgRes = await fetch(`/api/conversations/${data.conversationId}`);
        const msgData = await msgRes.json();
        setMessages(msgData.messages || []);
      }
    } catch {}
    setSending(false);
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !conversation || sending) return;

    const content = message;
    setSending(true);
    const tempId = `temp-${Date.now()}`;
    const userMsg: Message = {
      id: tempId,
      sender_type: "user",
      content,
      created_at: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");

    try {
      const res = await fetch(`/api/conversations/${conversation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();

      if (data.ok) {
        const msgRes = await fetch(`/api/conversations/${conversation.id}`);
        const msgData = await msgRes.json();
        setMessages(msgData.messages || []);
        if (msgData.conversation) {
          setConversation((prev) => prev ? { ...prev, status: msgData.conversation.status } : null);
        }
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
    setSending(false);
  };

  const submitRating = async () => {
    if (!conversation || rating < 1 || ratingBusy) return;
    setRatingBusy(true);
    try {
      const res = await fetch(`/api/conversations/${conversation.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: ratingComment }),
      });
      if (res.ok) {
        setRatingSubmitted(true);
        setConversation((prev) => prev ? { ...prev, rating } : null);
      }
    } catch {}
    setRatingBusy(false);
  };

  const senderLabel = (msg: Message) => {
    if (msg.sender_type === "user") return null;
    if (msg.sender_name) return msg.sender_name;
    if (msg.sender_type === "ai") return "AI Assistant";
    if (msg.sender_type === "support") return "Support Agent";
    return "System";
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="flex h-[min(500px,calc(100vh-48px))] w-[min(360px,calc(100vw-48px))] flex-col rounded-2xl border border-[#e5e7eb] bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#166534]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">Invoala Support</p>
                <p className="text-xs text-[#6b7280]">
                  {conversation?.status === "escalated" || conversation?.status === "support"
                    ? (closeWarning ? "Closing soon…" : "Human support")
                    : conversation?.status === "resolved"
                      ? "Resolved"
                      : "AI assistant"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-[#6b7280] hover:bg-[#f3f4f6]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {!conversation ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f0fdf4]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="mb-2 text-sm font-medium text-[#111827]">How can we help?</p>
                <p className="text-xs text-[#6b7280]">
                  Our AI assistant can answer most questions. If needed, we&apos;ll connect you with a human.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id}>
                    {senderLabel(msg) && (
                      <p className={`mb-1 text-[11px] font-medium ${msg.sender_type === "user" ? "text-right text-[#6b7280]" : "text-[#6b7280]"}`}>
                        {senderLabel(msg)}
                      </p>
                    )}
                    <div
                      className={`flex ${msg.sender_type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                          msg.sender_type === "user"
                            ? "bg-[#166534] text-white"
                            : msg.sender_type === "ai"
                              ? "bg-[#f3f4f6] text-[#111827]"
                              : msg.sender_type === "support"
                                ? "bg-[#dbeafe] text-[#1e40af]"
                                : msg.sender_type === "system"
                                  ? "bg-[#fef3c7] text-[#92400e]"
                                  : "bg-[#f3f4f6] text-[#111827]"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                {sending ? (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-2xl bg-[#f3f4f6] px-4 py-3">
                      <span className="text-[11px] font-medium text-[#6b7280]">
                        Invoala is thinking
                      </span>
                      <span className="flex items-center gap-0.5" aria-label="Thinking">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6b7280]"
                            style={{ animationDelay: `${i * 150}ms` }}
                          />
                        ))}
                      </span>
                    </div>
                  </div>
                ) : null}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Rating prompt */}
            {showRating && !ratingSubmitted && (
              <div className="mt-4 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
                <p className="text-sm font-medium text-[#111827]">How was your support experience?</p>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="text-2xl transition"
                    >
                      <span className={star <= (hoverRating || rating) ? "text-[#f59e0b]" : "text-[#d1d5db]"}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <>
                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="Optional: tell us more…"
                      rows={2}
                      maxLength={500}
                      className="mt-2 w-full resize-none rounded-lg border border-[#e5e7eb] px-3 py-2 text-xs focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534]"
                    />
                    <button
                      type="button"
                      onClick={() => void submitRating()}
                      disabled={ratingBusy}
                      className="mt-2 rounded-lg bg-[#166534] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#14532d] disabled:opacity-50"
                    >
                      {ratingBusy ? "Submitting…" : "Submit rating"}
                    </button>
                  </>
                )}
              </div>
            )}
            {ratingSubmitted && (
              <div className="mt-4 rounded-xl border border-[#dcfce7] bg-[#f0fdf4] p-4 text-center">
                <p className="text-sm font-medium text-[#166534]">Thanks for your feedback!</p>
              </div>
            )}
          </div>

          {/* Auto-close warning */}
          {closeWarning && (
            <div className="border-t border-[#fef3c7] bg-[#fef9e7] px-4 py-2.5">
              <p className="text-xs text-[#92600a]">{closeWarning}</p>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-[#e5e7eb] p-4">
            <form onSubmit={conversation ? sendMessage : startConversation} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={conversation ? "Type a message…" : "Ask a question…"}
                disabled={sending}
                className="flex-1 rounded-full border border-[#e5e7eb] px-4 py-2.5 text-sm focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#166534] text-white hover:bg-[#14532d] disabled:opacity-50"
              >
                {sending ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#166534] text-white shadow-lg transition hover:bg-[#14532d] hover:shadow-xl"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}
    </div>
  );
}
