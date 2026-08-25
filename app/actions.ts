"use server";

import { headers } from "next/headers";
import { deliver, rateLimit, type Lead } from "@/lib/leads";
import type { LeadState } from "@/lib/lead-state";

function clean(value: FormDataEntryValue | null, max: number): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export async function submitLead(
  _prev: LeadState,
  formData: FormData
): Promise<LeadState> {
  // Ловушка для ботов: поле спрятано от людей, автозаполнение его заполняет.
  if (clean(formData.get("company"), 100) !== "") {
    // Боту отвечаем как при успехе — чтобы он не подбирал обход.
    return { status: "ok", message: "Заявка получена.", invalid: [] };
  }

  const task = clean(formData.get("task"), 2000);
  const contact = clean(formData.get("contact"), 200);
  const budget = clean(formData.get("budget"), 100) || "Не указан";
  const page = clean(formData.get("page"), 200) || "/";
  const consent = formData.get("consent");

  const invalid: string[] = [];
  if (task.length < 10) invalid.push("task");
  if (contact.length < 5) invalid.push("contact");
  if (!consent) invalid.push("consent");

  if (invalid.length > 0) {
    return {
      status: "error",
      message:
        "Проверьте выделенные поля: опишите задачу хотя бы одним предложением, оставьте рабочий контакт и подтвердите согласие на обработку данных.",
      invalid,
    };
  }

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0].trim() ||
    headerList.get("x-real-ip") ||
    "unknown";

  const limit = rateLimit(ip);
  if (!limit.ok) {
    return {
      status: "error",
      message: `Слишком много заявок с одного адреса. Попробуйте через ${limit.retryAfterMin} мин или напишите в Telegram — так быстрее.`,
      invalid: [],
    };
  }

  const lead: Lead = {
    task,
    contact,
    budget,
    page,
    receivedAt: new Date().toISOString(),
    ip,
  };

  try {
    await deliver(lead);
  } catch (error) {
    console.error("[lead] не удалось сохранить заявку:", error);
    return {
      status: "error",
      message:
        "Не удалось отправить. Напишите напрямую на почту или в Telegram — так точно дойдёт.",
      invalid: [],
    };
  }

  return {
    status: "ok",
    message: "Заявка получена. Ответим в течение рабочего дня — обычно быстрее.",
    invalid: [],
  };
}
