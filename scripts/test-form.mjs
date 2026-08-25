/**
 * Проверка формы заявок настоящими HTTP-запросами по пути без JavaScript:
 * так же, как её отправит браузер с отключёнными скриптами, и так же,
 * как отправит бот. Запуск: node scripts/test-form.mjs [базовый-адрес]
 */

const BASE = process.argv[2] || "http://localhost:3100";
const PAGE = BASE + "/contacts/";

const decode = (s) =>
  s
    .replace(/&quot;/g, "\"")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

async function hiddenFields() {
  const html = await (await fetch(PAGE)).text();
  const fields = {};
  const re = /<input type="hidden" name="([^"]+)"(?: value="([^"]*)")?\s*\/>/g;
  let m;
  while ((m = re.exec(html)) !== null) fields[decode(m[1])] = decode(m[2] ?? "");
  return fields;
}

async function submit(values) {
  const body = new FormData();
  for (const [k, v] of Object.entries(await hiddenFields())) body.append(k, v);
  for (const [k, v] of Object.entries(values)) body.set(k, v);

  const res = await fetch(PAGE, { method: "POST", body, redirect: "follow" });
  const html = await res.text();

  if (html.includes("Заявка получена")) return "ok";
  if (html.includes("Слишком много заявок")) return "rate-limited";
  if (html.includes("Проверьте выделенные поля")) return "validation-error";
  if (html.includes("Не удалось отправить")) return "delivery-error";
  return "no-message (" + res.status + ")";
}

const valid = {
  task: "Отвалился обмен с 1С на интернет-магазине, заказы не уходят в учёт.",
  contact: "test@example.com",
  budget: "100 000 – 300 000 ₽",
  consent: "yes",
};

function check(name, actual, expected) {
  const pass = actual === expected;
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}: ${actual}${pass ? "" : " (ожидалось " + expected + ")"}`);
  return pass;
}

const results = [];

results.push(check("валидная заявка", await submit(valid), "ok"));

results.push(
  check("короткое описание задачи", await submit({ ...valid, task: "надо" }), "validation-error")
);

results.push(
  check("без согласия на обработку", await submit({ ...valid, consent: "" }), "validation-error")
);

results.push(
  check(
    "бот заполнил поле-ловушку",
    await submit({ ...valid, company: "ООО Спам" }),
    "ok" // боту отвечаем как при успехе, но заявка не сохраняется
  )
);

// Лимит: 5 попыток за 10 минут с одного адреса. Одна уже потрачена выше.
let limited = "не сработал";
for (let i = 0; i < 6; i++) {
  const r = await submit(valid);
  if (r === "rate-limited") {
    limited = "rate-limited";
    break;
  }
}
results.push(check("ограничение частоты отправки", limited, "rate-limited"));

console.log("\n" + results.filter(Boolean).length + " из " + results.length + " проверок пройдено");
process.exit(results.every(Boolean) ? 0 : 1);
