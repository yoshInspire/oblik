/**
 * Проверка почтового канала: читает .env, подключается к SMTP и отправляет
 * одно тестовое письмо. Форму при этом не трогает — так видно, дело в почте
 * или в чём-то другом. Запуск: node scripts/test-mail.mjs
 */

import { readFile } from "node:fs/promises";
import { createTransport } from "nodemailer";

async function loadEnv() {
  let raw;
  try {
    raw = await readFile(new URL("../.env", import.meta.url), "utf8");
  } catch {
    console.error("Файла .env нет рядом с проектом. Скопируйте .env.example в .env и заполните.");
    process.exit(1);
  }

  for (const line of raw.split("\n")) {
    const match = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    const value = match[2].trim().replace(/^["']|["']$/g, "");
    if (value !== "") process.env[match[1]] ??= value;
  }
}

await loadEnv();

const host = process.env.SMTP_HOST;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASSWORD;
const to = process.env.LEAD_EMAIL_TO || user;
const port = Number(process.env.SMTP_PORT) || 465;

console.log("SMTP_HOST     " + (host || "— не задан"));
console.log("SMTP_PORT     " + port);
console.log("SMTP_USER     " + (user || "— не задан"));
console.log("SMTP_PASSWORD " + (pass ? "задан, " + pass.length + " символов" : "— не задан"));
console.log("письмо уйдёт  " + (to || "— некуда"));
console.log("");

if (!host || !user || !pass || !to) {
  console.error("Не хватает переменных — письма отправляться не будут, заявка ляжет только в data/leads.jsonl.");
  process.exit(1);
}

const transport = createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 15_000,
});

try {
  await transport.verify();
  console.log("вход на сервер: успешно");

  const info = await transport.sendMail({
    from: `"Заявки с сайта" <${user}>`,
    to,
    subject: "Проверка почтового канала",
    text: [
      "Это тестовое письмо от scripts/test-mail.mjs.",
      "Если оно пришло — заявки с формы будут приходить сюда же.",
      "Отправлено: " + new Date().toISOString(),
    ].join("\n"),
  });

  console.log("письмо отправлено: " + info.messageId);
  console.log("\nПроверьте ящик " + to + ", в том числе папку «Спам».");
} catch (error) {
  console.error("не получилось: " + error.message);

  const code = String(error.responseCode || "");
  if (code === "535" || /auth/i.test(error.message)) {
    console.error(
      "\nПохоже на отказ в авторизации. У Яндекса нужен пароль приложения из\n" +
        "Яндекс ID (Безопасность → Пароли приложений → Почта), а не обычный\n" +
        "пароль от ящика. В SMTP_USER — полный адрес, вместе с @yandex.ru."
    );
  } else if (/timeout|ETIMEDOUT|ECONNREFUSED/i.test(error.message)) {
    console.error(
      "\nСоединение не установилось. Проверьте SMTP_HOST и SMTP_PORT, а на\n" +
        "сервере — что исходящий порт " + port + " не закрыт файрволом."
    );
  }
  process.exit(1);
}
