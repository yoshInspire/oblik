/**
 * Проверка контента против семантического ядра.
 *
 *   node scripts/seo/check-content.mjs
 *
 * Что проверяет:
 *   1. Покрытие: у каждого кластера из ядра есть страница с контентом.
 *   2. Метатеги: title ≤ 60, description ≤ 155, уникальность title/description/H1.
 *   3. Вхождение: главная фраза кластера присутствует в H1 или title.
 *   4. Уникальность текста: одинаковые предложения на разных страницах.
 *      Это главный критерий — шаблонный контент ловится именно здесь.
 *   5. Цены: на сайте не должно быть сумм.
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (p) => JSON.parse(readFileSync(resolve(root, p), "utf8"));

const clusters = read("seo/clusters.json");
const pages = readdirSync(resolve(root, "content/pages"))
  .filter((f) => f.endsWith(".json"))
  .flatMap((f) => read(`content/pages/${f}`));

const norm = (s) => s.toLowerCase().replace(/ё/g, "е").replace(/[^а-яa-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

let problems = 0;
const fail = (msg) => { problems += 1; console.log(`  ✗ ${msg}`); };

// ── 1. покрытие ─────────────────────────────────────────────────────────────
const covered = new Set(pages.map((p) => p.url));
const missing = clusters.filter((c) => !covered.has(c.url) && !["/about/", "/contacts/", "/"].includes(c.url));
const orphan = pages.filter((p) => !clusters.some((c) => c.url === p.url));

console.log("ПОКРЫТИЕ");
console.log(`  кластеров в ядре:      ${clusters.length}`);
console.log(`  страниц с контентом:   ${pages.length}`);
console.log(`  без контента:          ${missing.length}`);
if (orphan.length) console.log(`  вне ядра:              ${orphan.length} (${orphan.map((p) => p.url).join(", ")})`);
if (missing.length) {
  const bySection = {};
  for (const c of missing) (bySection[c.section] ??= []).push(c.url);
  for (const [s, urls] of Object.entries(bySection)) console.log(`    /${s}/: ${urls.length}`);
}

// ── 2. метатеги ─────────────────────────────────────────────────────────────
console.log("\nМЕТАТЕГИ");
const seen = { title: new Map(), description: new Map(), h1: new Map() };
for (const p of pages) {
  if (p.title.length > 60) fail(`title ${p.title.length} симв. — ${p.url}`);
  if (p.description.length > 155) fail(`description ${p.description.length} симв. — ${p.url}`);
  if (p.description.length < 70) fail(`description слишком короткий (${p.description.length}) — ${p.url}`);
  for (const field of ["title", "description", "h1"]) {
    const key = norm(p[field]);
    if (seen[field].has(key)) fail(`дубль ${field}: ${p.url} и ${seen[field].get(key)}`);
    else seen[field].set(key, p.url);
  }
}
if (problems === 0) console.log("  все длины и уникальность в норме");

// ── 3. вхождение главной фразы ──────────────────────────────────────────────
console.log("\nВХОЖДЕНИЕ ГЛАВНОЙ ФРАЗЫ");
let misses = 0;
for (const p of pages) {
  const cluster = clusters.find((c) => c.url === p.url);
  if (!cluster) continue;
  const head = norm(cluster.head);
  const hay = norm(`${p.h1} ${p.title}`);
  // Грубая нормализация окончаний: «мобильного» и «мобильных» — одно слово.
  const stem = (w) => w.slice(0, Math.max(5, w.length - 3));
  const words = head.split(" ").filter((w) => w.length > 3);
  const hit = words.filter((w) => hay.includes(stem(w))).length / Math.max(words.length, 1);
  if (hit < 0.5) { misses += 1; console.log(`  ~ слабое вхождение «${cluster.head}» — ${p.url}`); }
}
if (misses === 0) console.log("  главные фразы отражены в H1/title");

// ── 4. уникальность текста ──────────────────────────────────────────────────
console.log("\nУНИКАЛЬНОСТЬ ТЕКСТА");
const sentences = new Map(); // предложение → [url]
const textOf = (p) => {
  const out = [...(p.lead ?? [])];
  for (const b of p.blocks ?? []) {
    out.push(b.title ?? "", b.lead ?? "");
    for (const it of b.items ?? []) out.push(typeof it === "string" ? it : `${it.t}. ${it.d}`);
    out.push(...(b.paras ?? []));
  }
  for (const g of p.groups ?? []) out.push(g.title, g.lead ?? "");
  for (const f of p.faq ?? []) out.push(f.q, f.a);
  out.push(p.cta?.t ?? "", p.cta?.d ?? "");
  return out.filter(Boolean);
};

let totalSentences = 0;
for (const p of pages) {
  for (const chunk of textOf(p)) {
    for (const raw of chunk.split(/(?<=[.!?])\s+/)) {
      const s = norm(raw);
      if (s.split(" ").length < 5) continue; // короткие пункты списков не считаем
      totalSentences += 1;
      if (!sentences.has(s)) sentences.set(s, []);
      const list = sentences.get(s);
      if (!list.includes(p.url)) list.push(p.url);
    }
  }
}
const dupes = [...sentences.entries()].filter(([, urls]) => urls.length > 1);
console.log(`  предложений всего:     ${totalSentences}`);
console.log(`  повторов между стр.:   ${dupes.length}`);
for (const [s, urls] of dupes.slice(0, 12)) {
  fail(`повтор на ${urls.length} стр.: «${s.slice(0, 70)}…» — ${urls.join(", ")}`);
}

// ── 5. цены ─────────────────────────────────────────────────────────────────
console.log("\nЦЕНЫ");
const priceRe = /(\d[\d\s  ]{2,})\s*(₽|руб|р\.)|(₽|руб\.?)\s*\d|\bот\s+\d[\d\s]{3,}/i;
let priceHits = 0;
for (const p of pages) {
  for (const chunk of [...textOf(p), p.title, p.description]) {
    if (priceRe.test(chunk)) { priceHits += 1; fail(`сумма в тексте — ${p.url}: «${chunk.slice(0, 80)}»`); }
  }
}
if (priceHits === 0) console.log("  сумм в контенте нет");

console.log(`\n${problems === 0 ? "✓ ошибок нет" : `✗ проблем: ${problems}`}`);
process.exit(problems > 0 ? 1 : 0);
