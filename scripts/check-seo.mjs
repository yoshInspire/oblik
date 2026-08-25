/**
 * Проверка того, что видят поисковые роботы: длина title и description,
 * единственность H1, наличие canonical и микроразметки на каждой странице.
 * Запуск: node scripts/check-seo.mjs [базовый-адрес]
 */

const BASE = process.argv[2] || "http://localhost:3100";

const paths = [
  "/",
  "/uslugi/",
  "/price/",
  "/about/",
  "/contacts/",
  "/uslugi/dorabotka-sajta/",
  "/uslugi/podderzhka-sajta/",
  "/uslugi/audit-i-uskorenie/",
  "/uslugi/integracii/",
  "/uslugi/vydelennaya-komanda/",
  "/uslugi/redesign/",
  "/uslugi/korporativnye-sajty/",
  "/uslugi/internet-magazin/",
  "/uslugi/veb-servisy/",
  "/uslugi/mvp/",
  "/uslugi/landing/",
];

const decode = (s) =>
  s.replace(/&quot;/g, "\"").replace(/&#x27;/g, "'").replace(/&amp;/g, "&");

const grab = (html, re) => {
  const m = html.match(re);
  return m ? decode(m[1]).trim() : "";
};

let failures = 0;
const rows = [];

for (const path of paths) {
  const res = await fetch(BASE + path);
  const html = await res.text();

  const title = grab(html, /<title>([^<]*)<\/title>/);
  const desc = grab(html, /name="description" content="([^"]*)"/);
  const canonical = grab(html, /rel="canonical" href="([^"]*)"/);
  const h1Count = (html.match(/<h1[\s>]/g) || []).length;
  const ldTypes = [...html.matchAll(/"@type":"([A-Za-z]+)"/g)].map((m) => m[1]);

  const problems = [];
  if (res.status !== 200) problems.push("код " + res.status);
  if (title.length === 0) problems.push("нет title");
  if (title.length > 65) problems.push("title " + title.length + " симв.");
  if (desc.length < 70 || desc.length > 185) problems.push("description " + desc.length + " симв.");
  if (h1Count !== 1) problems.push("H1: " + h1Count);
  if (!canonical) problems.push("нет canonical");
  if (path.startsWith("/uslugi/") && path !== "/uslugi/" && !ldTypes.includes("Service"))
    problems.push("нет разметки Service");
  if (!ldTypes.includes("ProfessionalService")) problems.push("нет разметки организации");

  if (problems.length) failures++;
  rows.push({
    path,
    title: title.length,
    desc: desc.length,
    h1: h1Count,
    ld: [...new Set(ldTypes)].length,
    status: problems.length ? "FAIL: " + problems.join(", ") : "ok",
  });
}

const pad = (s, n) => String(s).padEnd(n);
console.log(pad("URL", 34) + pad("title", 7) + pad("descr", 7) + pad("H1", 4) + pad("схем", 6) + "статус");
console.log("-".repeat(96));
for (const r of rows) {
  console.log(pad(r.path, 34) + pad(r.title, 7) + pad(r.desc, 7) + pad(r.h1, 4) + pad(r.ld, 6) + r.status);
}
console.log("\n" + (paths.length - failures) + " из " + paths.length + " страниц без замечаний");
process.exit(failures === 0 ? 0 : 1);
