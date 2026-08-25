import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export type Lead = {
  task: string;
  contact: string;
  budget: string;
  page: string;
  receivedAt: string;
  ip: string;
};

/* ------------------------------------------------------------------
   Ограничение частоты отправки.
   Счётчик живёт в памяти процесса: этого достаточно для одного сервера
   и для защиты от простого перебора. При запуске в нескольких копиях
   (несколько инстансов, serverless) счётчик нужно вынести в Redis —
   см. README, раздел «Что доделать перед боем».
   ------------------------------------------------------------------ */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

export function rateLimit(ip: string): { ok: boolean; retryAfterMin: number } {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    const oldest = Math.min(...recent);
    const retryAfterMin = Math.ceil((WINDOW_MS - (now - oldest)) / 60000);
    hits.set(ip, recent);
    return { ok: false, retryAfterMin };
  }

  recent.push(now);
  hits.set(ip, recent);

  // Чистим карту, чтобы она не росла бесконечно на длинных аптаймах.
  if (hits.size > 5000) {
    for (const [key, stamps] of hits) {
      if (stamps.every((t) => now - t > WINDOW_MS)) hits.delete(key);
    }
  }

  return { ok: true, retryAfterMin: 0 };
}

/* ------------------------------------------------------------------
   Сохранение и уведомления.
   Заявка пишется в файл всегда — это последняя линия обороны на случай,
   если уведомления не дойдут. Уведомления отправляются параллельно и
   их сбой не роняет отправку формы.
   ------------------------------------------------------------------ */

async function persist(lead: Lead): Promise<void> {
  const dir = join(process.cwd(), "data");
  await mkdir(dir, { recursive: true });
  await appendFile(join(dir, "leads.jsonl"), JSON.stringify(lead) + "\n", "utf8");
}

async function notifyTelegram(lead: Lead): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = [
    "Новая заявка с сайта",
    "",
    "Задача: " + lead.task,
    "Контакт: " + lead.contact,
    "Бюджет: " + lead.budget,
    "Страница: " + lead.page,
  ].join("\n");

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });
}

async function notifyWebhook(lead: Lead): Promise<void> {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
}

export async function deliver(lead: Lead): Promise<void> {
  await persist(lead);

  const results = await Promise.allSettled([notifyTelegram(lead), notifyWebhook(lead)]);
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[lead] канал уведомления недоступен:", result.reason);
    }
  }
}
