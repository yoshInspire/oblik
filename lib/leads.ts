import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export type Lead = {
  task: string;
  contact: string;
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

/* Человек на сайте ждёт ответа формы прямо сейчас, поэтому внешним каналам
   отведено ограниченное время. Не уложился — пишем в журнал и живём дальше:
   заявка к этому моменту уже лежит в файле. */
const CHANNEL_TIMEOUT_MS = 8000;

/* fetch считает успехом любой ответ сервера, включая 400 и 403. Без этой
   проверки мёртвый канал выглядел бы работающим: телеграм ответит «неверный
   chat_id», а в журнал ничего не попадёт и никто не узнает. */
async function ensureOk(res: Response, channel: string): Promise<void> {
  if (res.ok) return;
  const body = (await res.text().catch(() => "")).slice(0, 300);
  throw new Error(channel + " ответил " + res.status + ": " + body);
}

async function notifyTelegram(lead: Lead): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  // Адрес API вынесен в переменную: если прямой доступ к телеграму закрыт,
  // сюда подставляется собственный релей, и код менять не надо.
  const api = process.env.TELEGRAM_API_BASE || "https://api.telegram.org";

  const text = [
    "Новая заявка с сайта",
    "",
    "Задача: " + lead.task,
    "Контакт: " + lead.contact,
    "Страница: " + lead.page,
  ].join("\n");

  const res = await fetch(`${api}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    signal: AbortSignal.timeout(CHANNEL_TIMEOUT_MS),
  });
  await ensureOk(res, "телеграм");
}

async function notifyWebhook(lead: Lead): Promise<void> {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
    signal: AbortSignal.timeout(CHANNEL_TIMEOUT_MS),
  });
  await ensureOk(res, "вебхук");
}

async function notifyEmail(lead: Lead): Promise<void> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const to = process.env.LEAD_EMAIL_TO || user;
  if (!host || !user || !pass || !to) return;

  // Порт 465 — SMTP поверх SSL, 587 — STARTTLS. У Яндекса рабочий 465.
  const port = Number(process.env.SMTP_PORT) || 465;

  // Подключаем на месте: пока почта не настроена, модуль не грузится вовсе.
  const { createTransport } = await import("nodemailer");

  const transport = createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    // Человек ждёт ответа формы прямо сейчас — не даём SMTP подвесить отправку.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  // Отвечать прямо из почты можно, только если в контакте оставили адрес:
  // там же бывает телефон или телеграм.
  const contactIsEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.contact);
  const subject = lead.task.length > 60 ? lead.task.slice(0, 60) + "…" : lead.task;

  await transport.sendMail({
    // Яндекс принимает письмо только от имени того ящика, под которым вошли.
    from: `"Заявки с сайта" <${user}>`,
    to,
    replyTo: contactIsEmail ? lead.contact : undefined,
    subject: "Заявка с сайта: " + subject,
    text: [
      "Задача: " + lead.task,
      "Контакт: " + lead.contact,
      "Страница: " + lead.page,
      "Получена: " + lead.receivedAt,
    ].join("\n"),
  });
}

export async function deliver(lead: Lead): Promise<void> {
  await persist(lead);

  const results = await Promise.allSettled([
    notifyTelegram(lead),
    notifyEmail(lead),
    notifyWebhook(lead),
  ]);
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[lead] канал уведомления недоступен:", result.reason);
    }
  }
}
