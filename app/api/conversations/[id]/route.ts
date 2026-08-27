import { randomUUID } from "crypto";
import { getSessionUser } from "@/lib/server-auth";
import { getDb } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = getSessionUser(_req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getDb();

  const conversation = db.prepare("SELECT * FROM conversations WHERE id = ? AND user_id = ?").get(id, user.id) as
    | { id: string; user_id: string; status: string; subject: string; created_at: number; updated_at: number }
    | undefined;

  if (!conversation) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const messages = db.prepare("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC").all(id);

  // Mark as read
  db.prepare("UPDATE conversations SET updated_at = ? WHERE id = ?").run(Date.now(), id);

  return Response.json({ conversation, messages });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let content = "";
  try {
    const body = (await req.json()) as { content?: string };
    content = typeof body.content === "string" ? body.content.trim() : "";
  } catch {}

  if (!content) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const db = getDb();
  const conversation = db.prepare("SELECT * FROM conversations WHERE id = ? AND user_id = ?").get(id, user.id) as
    | { id: string; status: string }
    | undefined;

  if (!conversation) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const now = Date.now();

  // Add user message
  db.prepare(`
    INSERT INTO messages (id, conversation_id, sender_type, sender_id, content, created_at)
    VALUES (?, ?, 'user', ?, ?, ?)
  `).run(randomUUID(), id, user.id, content, now);

  db.prepare("UPDATE conversations SET updated_at = ? WHERE id = ?").run(now, id);

  // If conversation is in AI mode, generate AI response
  if (conversation.status === "ai") {
    const aiResponse = await generateAiResponse(content);
    
    if (aiResponse.escalate) {
      db.prepare("UPDATE conversations SET status = 'escalated', updated_at = ? WHERE id = ?").run(now + 1, id);
      
      db.prepare(`
        INSERT INTO messages (id, conversation_id, sender_type, sender_id, content, created_at)
        VALUES (?, ?, 'system', NULL, ?, ?)
      `).run(randomUUID(), id, "This conversation has been escalated to our support team. A team member will respond shortly.", now + 1);

      await sendToTelegram(user.email, content, id);
    } else {
      db.prepare(`
        INSERT INTO messages (id, conversation_id, sender_type, sender_id, content, created_at)
        VALUES (?, ?, 'ai', NULL, ?, ?)
      `).run(randomUUID(), id, aiResponse.message, now + 1);
    }

    db.prepare("UPDATE conversations SET updated_at = ? WHERE id = ?").run(now + 1, id);
  }

  return Response.json({ ok: true });
}

async function generateAiResponse(message: string): Promise<{ message: string; escalate: boolean }> {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("plan")) {
    return {
      message: "We offer 4 plans:\n\n• Free - Basic invoicing\n• Pro Monthly - $9/mo\n• Pro Yearly - $79/yr (save 27%)\n• Teams Monthly - $29/mo\n• Teams Yearly - $249/yr\n• Lifetime - $499 (one-time)\n\nAll paid plans include unlimited invoices, AI-powered drafting, and priority support.",
      escalate: false
    };
  }
  
  if (lowerMessage.includes("how") && (lowerMessage.includes("invoice") || lowerMessage.includes("create"))) {
    return {
      message: "Creating an invoice is easy:\n\n1. Go to the homepage and click 'Create invoice'\n2. Fill in your business details and client info\n3. Add line items with quantities and rates\n4. Preview your invoice in real-time\n5. Download as PDF or print directly\n\nYou can also use our AI feature - just describe your invoice in plain English!",
      escalate: false
    };
  }
  
  if (lowerMessage.includes("ai") || lowerMessage.includes("describe")) {
    return {
      message: "Our AI invoice drafting feature lets you create invoices from natural language. Just describe your work:\n\n• 'I designed a logo for Acme Corp for $500'\n• 'Monthly consulting for TechCo, 10 hours at $150/hr'\n• 'Website development for StartupXYZ, $2,500'\n\nThe AI will extract client details, line items, and amounts automatically!",
      escalate: false
    };
  }
  
  if (lowerMessage.includes("team")) {
    return {
      message: "Teams plans allow collaboration:\n\n• Invite members via email\n• Assign roles (admin or member)\n• Share invoices and clients\n• Max 5 members per team\n\nTeams plans start at $29/mo or $249/yr.",
      escalate: false
    };
  }
  
  if (lowerMessage.includes("cancel") || lowerMessage.includes("refund")) {
    return {
      message: "To cancel your subscription:\n\n1. Go to Dashboard → Billing\n2. Click 'Cancel plan'\n3. Your access continues until the billing period ends\n\nFor refund requests, I'll connect you with our support team.",
      escalate: lowerMessage.includes("refund")
    };
  }
  
  if (lowerMessage.includes("bug") || lowerMessage.includes("error") || lowerMessage.includes("broken") || lowerMessage.includes("not working")) {
    return {
      message: "I'm sorry you're experiencing issues. I've escalated this to our support team who will help you directly.",
      escalate: true
    };
  }
  
  return {
    message: "I've connected you with our support team. A team member will review your message and respond shortly.",
    escalate: true
  };
}

async function sendToTelegram(userEmail: string, message: string, conversationId: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!botToken || !chatId) return;
  
  const text = `🔔 New support request\n\nFrom: ${userEmail}\nConversation: ${conversationId}\n\nMessage:\n${message}`;
  
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML"
      })
    });
  } catch {}
}
