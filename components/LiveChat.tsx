"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

type Message = {
  id: string;
  sender_type: string;
  content: string;
  created_at: number;
};

type Conversation = {
  id: string;
  status: string;
  subject: string;
};

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = async () => {
    if (!message.trim()) return;
    
    setSending(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: "Support request", content: message }),
      });
      const data = await res.json();
      
      if (data.ok) {
        setConversation({ id: data.conversationId, status: data.escalated ? "escalated" : "ai", subject: "Support request" });
        setMessage("");
        
        // Load messages
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
    
    setSending(true);
    const userMsg: Message = {
      id: "temp",
      sender_type: "user",
      content: message,
      created_at: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    
    try {
      const res = await fetch(`/api/conversations/${conversation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });
      const data = await res.json();
      
      if (data.ok) {
        // Reload messages
        const msgRes = await fetch(`/api/conversations/${conversation.id}`);
        const msgData = await msgRes.json();
        setMessages(msgData.messages || []);
      }
    } catch {}
    setSending(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="flex h-[500px] w-[360px] flex-col rounded-2xl border border-[#e5e7eb] bg-white shadow-2xl">
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
                    ? "Human support" 
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
                  <div
                    key={msg.id}
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
                              : "bg-[#fef3c7] text-[#92400e]"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-[#e5e7eb] p-4">
            <form onSubmit={conversation ? sendMessage : startConversation} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={conversation ? "Type a message..." : "Ask a question..."}
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
