/**
 * Сборка семантического ядра: маркеры → расширение → чистка → кластеризация → карта релевантности.
 *
 *   node scripts/seo/build-core.mjs
 *
 * На выходе:
 *   seo/keywords.tsv   — все фразы: фраза | URL | интент | тип | слов | оценка частотности
 *   seo/clusters.json  — кластеры (URL → фразы), готовые к разбору контентом
 *   seo/report.txt     — отчёт: объём, распределение, риски каннибализации
 *
 * Частотность помечена оценкой по длине и типу фразы, а не выдуманным числом.
 * Реальные частоты подставляются скриптом wordstat.mjs, когда появится токен API.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const src = JSON.parse(readFileSync(resolve(root, "seo/markers.json"), "utf8"));

// ── нормализация ────────────────────────────────────────────────────────────
const norm = (s) =>
  s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[«»"„“”]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// ── шаблоны расширения ──────────────────────────────────────────────────────
// Полный набор — только к главной форме маркера, иначе получается мусор
// вида «сделать сайт отзывы».
const FULL = [
  { t: (p) => p, type: "base" },
  { t: (p) => `${p} цена`, type: "price" },
  { t: (p) => `${p} стоимость`, type: "price" },
  { t: (p) => `сколько стоит ${p}`, type: "price" },
  { t: (p) => `${p} под ключ`, type: "base", skipIf: /под ключ/ },
  { t: (p) => `${p} на заказ`, type: "order", skipIf: /на заказ/ },
  { t: (p) => `${p} недорого`, type: "price" },
  { t: (p) => `${p} срочно`, type: "order" },
  { t: (p) => `${p} компания`, type: "vendor" },
  { t: (p) => `${p} студия`, type: "vendor" },
  { t: (p) => `${p} агентство`, type: "vendor" },
  { t: (p) => `${p} отзывы`, type: "vendor" },
];

// Сокращённый набор — к синонимам.
const SHORT = [
  { t: (p) => p, type: "base" },
  { t: (p) => `${p} цена`, type: "price" },
  { t: (p) => `${p} стоимость`, type: "price" },
  { t: (p) => `${p} на заказ`, type: "order", skipIf: /на заказ|разработчик/ },
];

const ACC = [
  { t: (a) => `заказать ${a}`, type: "order" },
  { t: (a) => `заказать ${a} недорого`, type: "order" },
];

const GEO = [
  { t: (p, g) => `${p} ${g.nom}`, type: "geo" },
  { t: (p, g) => `${p} ${g.pre}`, type: "geo" },
  { t: (p, g) => `${p} цена ${g.nom}`, type: "geo" },
];

// ── расширение ──────────────────────────────────────────────────────────────
const rows = new Map(); // norm(phrase) → row
const collisions = [];

function push(phrase, marker, type, cluster = marker.cluster) {
  const key = norm(phrase);
  if (!key || key.split(" ").length > 8) return;
  const existing = rows.get(key);
  if (existing) {
    if (existing.cluster !== cluster) {
      collisions.push({ phrase: key, a: existing.cluster, b: cluster });
      // Побеждает более специфичный маркер — у него длиннее главная форма.
      if (marker.nom.length > existing.nomLen) {
        rows.set(key, row(key, marker, type, cluster));
      }
    }
    return;
  }
  rows.set(key, row(key, marker, type, cluster));
}

function row(phrase, marker, type, cluster) {
  return {
    phrase,
    cluster,
    marker: marker.id,
    intent: marker.intent,
    type,
    nomLen: marker.nom.length,
  };
}

function apply(templates, phrase, marker) {
  for (const tpl of templates) {
    if (tpl.skipIf && tpl.skipIf.test(phrase)) continue;
    push(tpl.t(phrase), marker, tpl.type);
  }
}

for (const marker of src.markers) {
  if (marker.intent === "hub") {
    push(marker.nom, marker, "base");
    for (const alt of marker.alt) push(alt, marker, "base");
    if (marker.geo) {
      const msk = src.geo.find((g) => g.priority === 1);
      push(`${marker.nom} ${msk.nom}`, marker, "geo");
      push(`${marker.nom} ${msk.pre}`, marker, "geo");
    }
    continue;
  }

  if (marker.intent === "informational") {
    push(marker.nom, marker, "question");
    for (const alt of marker.alt) push(alt, marker, "question");
    continue;
  }

  apply(FULL, marker.nom, marker);
  for (const alt of marker.alt) apply(SHORT, alt, marker);
  if (marker.acc) apply(ACC, marker.acc, marker);

  if (marker.intent === "mixed") {
    for (const alt of marker.alt) push(alt, marker, "question");
  }

  if (marker.geo) {
    const bases = [marker.nom, ...marker.alt.slice(0, 2)];
    for (const g of src.geo) {
      // Москва — регион привязки сайта, её запросы остаются на самой услуге.
      // Остальные города собираются в отдельный гео-уровень, чтобы страницы
      // услуг не конкурировали сами с собой по региональной выдаче.
      const cluster = g.priority === 1 ? marker.cluster : `/goroda/${g.slug}/`;
      // По Москве берём все формулировки, по остальным городам — только
      // главную форму: гео-страница не должна перевешивать саму услугу.
      const geoBases = g.priority === 1 ? bases : [marker.nom];
      for (const base of geoBases) {
        for (const tpl of GEO) push(tpl.t(base, g), marker, tpl.type, cluster);
      }
      if (marker.acc) push(`заказать ${marker.acc} ${g.pre}`, marker, "geo", cluster);
    }
  }
}

// ── чистка ──────────────────────────────────────────────────────────────────
const stop = src.stopWords.map(norm);
const dirty = [];
for (const [key, r] of rows) {
  if (stop.some((w) => key.includes(w))) {
    dirty.push(key);
    rows.delete(key);
  }
}

// ── оценка частотности ──────────────────────────────────────────────────────
// ВЧ/СЧ/НЧ по длине и типу. Это оценка для приоритизации, не данные Wordstat.
function band(r) {
  const words = r.phrase.split(" ").length;
  if (r.type === "geo") return words <= 4 ? "СЧ" : "НЧ";
  if (r.type === "question" || r.type === "vendor") return "НЧ";
  if (words <= 2) return "ВЧ";
  if (words === 3) return r.type === "price" ? "СЧ" : "ВЧ";
  if (words === 4) return "СЧ";
  return "НЧ";
}

const all = [...rows.values()].map((r) => ({ ...r, band: band(r), words: r.phrase.split(" ").length }));
all.sort((a, b) => a.cluster.localeCompare(b.cluster) || a.phrase.localeCompare(b.phrase));

// ── кластеры ────────────────────────────────────────────────────────────────
const byCluster = new Map();
for (const r of all) {
  if (!byCluster.has(r.cluster)) {
    const city = r.cluster.startsWith("/goroda/")
      ? src.geo.find((g) => `/goroda/${g.slug}/` === r.cluster)
      : null;
    const m = city ? null : src.markers.find((x) => x.cluster === r.cluster);
    byCluster.set(r.cluster, {
      url: r.cluster,
      id: city ? city.slug : m.id,
      intent: city ? "commercial" : m.intent,
      section: r.cluster.split("/")[1] || "root",
      level: r.cluster === "/" ? 0 : r.cluster.split("/").filter(Boolean).length,
      head: city ? `разработка сайтов ${city.pre}` : m.nom,
      phrases: [],
    });
  }
  byCluster.get(r.cluster).phrases.push({ p: r.phrase, t: r.type, b: r.band });
}

const clusters = [...byCluster.values()].sort((a, b) => a.url.localeCompare(b.url));
for (const c of clusters) c.count = c.phrases.length;

// ── вывод ───────────────────────────────────────────────────────────────────
const tsv = ["фраза\tURL\tинтент\tтип\tслов\tоценка"];
for (const r of all) {
  tsv.push([r.phrase, r.cluster, r.intent, r.type, r.words, r.band].join("\t"));
}
writeFileSync(resolve(root, "seo/keywords.tsv"), tsv.join("\n") + "\n", "utf8");
writeFileSync(resolve(root, "seo/clusters.json"), JSON.stringify(clusters, null, 2) + "\n", "utf8");

const bySection = {};
for (const c of clusters) {
  bySection[c.section] = bySection[c.section] || { pages: 0, phrases: 0 };
  bySection[c.section].pages += 1;
  bySection[c.section].phrases += c.count;
}

const thin = clusters.filter((c) => c.count < 8);
const uniqueCollisions = [...new Map(collisions.map((c) => [c.phrase, c])).values()];

const report = [];
report.push("СЕМАНТИЧЕСКОЕ ЯДРО");
report.push("");
report.push(`маркеров:            ${src.markers.length}`);
report.push(`фраз после чистки:   ${all.length}`);
report.push(`отсеяно по стоп-словам: ${dirty.length}`);
report.push(`страниц (кластеров): ${clusters.length}`);
report.push("");
report.push("ПО РАЗДЕЛАМ");
for (const [section, s] of Object.entries(bySection).sort((a, b) => b[1].phrases - a[1].phrases)) {
  report.push(`  /${section}/`.padEnd(24) + `${String(s.pages).padStart(3)} стр.  ${String(s.phrases).padStart(5)} фраз`);
}
report.push("");
report.push("ПО ИНТЕНТАМ");
for (const i of ["commercial", "mixed", "informational"]) {
  report.push(`  ${i.padEnd(16)}${String(all.filter((r) => r.intent === i).length).padStart(5)}`);
}
report.push("");
report.push("ПО ЧАСТОТНОСТИ (оценка)");
for (const b of ["ВЧ", "СЧ", "НЧ"]) {
  report.push(`  ${b.padEnd(16)}${String(all.filter((r) => r.band === b).length).padStart(5)}`);
}
report.push("");
report.push(`РИСК КАННИБАЛИЗАЦИИ: ${uniqueCollisions.length} фраз претендовали на два URL`);
for (const c of uniqueCollisions.slice(0, 20)) report.push(`  ${c.phrase}  —  ${c.a} / ${c.b}`);
report.push("");
report.push(`ТОНКИЕ КЛАСТЕРЫ (<8 фраз): ${thin.length}`);
for (const c of thin) report.push(`  ${c.url}  (${c.count})`);
report.push("");
report.push("ТОП-15 КЛАСТЕРОВ ПО ОБЪЁМУ");
for (const c of [...clusters].sort((a, b) => b.count - a.count).slice(0, 15)) {
  report.push(`  ${String(c.count).padStart(4)}  ${c.url}`);
}

const text = report.join("\n") + "\n";
writeFileSync(resolve(root, "seo/report.txt"), text, "utf8");
console.log(text);
