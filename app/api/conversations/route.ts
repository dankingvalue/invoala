import { randomUUID } from "crypto";
import { getSessionUser } from "@/lib/server-auth";
import { dbGet, dbAll, dbRun } from "@/lib/db";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = await dbAll(`
    SELECT c.*,
      (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT sender_type FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_sender,
      (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_type = 'user' AND created_at > COALESCE(
        (SELECT created_at FROM messages WHERE conversation_id = c.id AND sender_type != 'user' ORDER BY created_at DESC LIMIT 1), 0
      )) as unread_count
    FROM conversations c
    WHERE c.user_id = ?
    ORDER BY c.updated_at DESC
  `, user.id);

  return Response.json({ conversations });
}

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let subject = "";
  let content = "";
  try {
    const body = (await req.json()) as { subject?: string; content?: string };
    subject = typeof body.subject === "string" ? body.subject.trim() : "";
    content = typeof body.content === "string" ? body.content.trim() : "";
  } catch {}

  if (!content) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const convId = randomUUID();
  const now = Date.now();

  await dbRun(
    `INSERT INTO conversations (id, user_id, status, subject, created_at, updated_at)
    VALUES (?, ?, 'ai', ?, ?, ?)`,
    convId, user.id, subject || "Support request", now, now
  );

  await dbRun(
    `INSERT INTO messages (id, conversation_id, sender_type, sender_id, content, created_at)
    VALUES (?, ?, 'user', ?, ?, ?)`,
    randomUUID(), convId, user.id, content, now
  );

  // Generate AI response
  const aiResponse = await generateAiResponse(content, user.email);

  if (aiResponse.escalate) {
    // Escalate to human support
    await dbRun("UPDATE conversations SET status = 'escalated', updated_at = ? WHERE id = ?", now, convId);

    await dbRun(
      `INSERT INTO messages (id, conversation_id, sender_type, sender_id, content, created_at)
      VALUES (?, ?, 'system', NULL, ?, ?)`,
      randomUUID(), convId, "This conversation has been escalated to our support team. A team member will respond shortly.", now + 1
    );

    // Send to Telegram
    await sendToTelegram(user.email, content, convId);
  } else {
    await dbRun(
      `INSERT INTO messages (id, conversation_id, sender_type, sender_id, content, created_at)
      VALUES (?, ?, 'ai', NULL, ?, ?)`,
      randomUUID(), convId, aiResponse.message, now + 1
    );
  }

  await dbRun("UPDATE conversations SET updated_at = ? WHERE id = ?", now + 1, convId);

  return Response.json({
    ok: true,
    conversationId: convId,
    escalated: aiResponse.escalate
  });
}

async function generateAiResponse(message: string, userEmail: string): Promise<{ message: string; escalate: boolean }> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY;

  // If no AI key, use predefined responses
  const lowerMessage = message.toLowerCase();

  // Check for common questions
  if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("plan")) {
    return {
      message: "We offer 4 plans:\n\n• Free - Basic invoicing\n• Pro Monthly - $9/mo\n• Pro Yearly - $79/yr (save 27%)\n• Teams Monthly - $29/mo\n• Teams Yearly - $249/yr\n• Lifetime - $499 (one-time)\n\nAll paid plans include unlimited invoices, AI-powered drafting, and priority support. Visit invoala.com/#pricing for details.",
      escalate: false
    };
  }

  if (lowerMessage.includes("how") && (lowerMessage.includes("invoice") || lowerMessage.includes("create"))) {
    return {
      message: "Creating an invoice is easy:\n\n1. Go to the homepage and click 'Create invoice'\n2. Fill in your business details and client info\n3. Add line items with quantities and rates\n4. Preview your invoice in real-time\n5. Download as PDF or print directly\n\nYou can also use our AI feature - just describe your invoice in plain English and we'll draft it for you!",
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
      message: "I'm sorry you're experiencing issues. I've escalated this to our support team who will help you directly. Please include:\n\n• What you were trying to do\n• What happened instead\n• Your browser and device\n\nA team member will respond shortly.",
      escalate: true
    };
  }

  // Default: escalate to human
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
