import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));

const site = read("content/site.json");
const services = [...read("content/services-build.json"), ...read("content/services-support.json")];

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const rows = (arr) => arr.join("\n");

const table = (head, body, min = 660) => `
<div class="panel"><div class="scroll"><table style="min-width:${min}px">
<thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
<tbody>${body}</tbody>
</table></div></div>`;

const faqBlock = (faq) => `
<h4 class="mini">FAQ на странице</h4>
<dl class="faq">
${faq
  .map((f) => `<div><dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd></div>`)
  .join("\n")}
</dl>`;

const serviceCard = (s) => `
<article class="cluster" id="${s.slug}">
  <div class="cl-top">
    <span class="cl-id">${esc(s.cluster)}</span>
    <span class="cl-name">${esc(s.h1)}</span>
    <span class="cl-url">/uslugi/${esc(s.slug)}/</span>
    <span class="chip p1">${esc(s.priceFrom)}</span>
    <span class="chip p2">${esc(s.term)}</span>
  </div>
  <div class="cl-body">
    <h4 class="mini">Мета-теги</h4>
    <p class="meta"><b>title:</b> ${esc(s.title)}</p>
    <p class="meta"><b>description:</b> ${esc(s.description)}</p>

    <h4 class="mini">Первый экран</h4>
    <p class="h1demo">${esc(s.h1)}</p>
    <p class="lede">${esc(s.lead)}</p>

    <h4 class="mini">Что входит</h4>
    <ul class="ticks">
      ${s.includes.map((i) => `<li><b>${esc(i.t)}.</b> ${esc(i.d)}</li>`).join("\n")}
    </ul>

    <h4 class="mini">Пакеты и цены</h4>
    <div class="packs">
      ${s.packages
        .map(
          (p) => `<div class="pack">
        <div class="pack-name">${esc(p.name)}</div>
        <div class="pack-price">${esc(p.price)}</div>
        <div class="pack-term">${esc(p.term)}</div>
        <ul>${p.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
      </div>`
        )
        .join("\n")}
    </div>

    <h4 class="mini">Процесс</h4>
    ${table(
      ["Этап", "Что происходит", "Срок"],
      rows(
        s.process.map(
          (p) =>
            `<tr><td class="kw">${esc(p.t)}</td><td>${esc(p.d)}</td><td class="num">${esc(p.dur)}</td></tr>`
        )
      ),
      560
    )}

    ${faqBlock(s.faq)}

    <p class="note"><b>Перелинковка:</b> ${s.related
      .map((r) => `<code>/uslugi/${esc(r)}/</code>`)
      .join(" · ")}</p>
  </div>
</article>`;

const html = `<title>Тексты «Верста»</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600&family=Golos+Text:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root{
  --ground:#F4F6F3; --surface:#FFFFFF; --surface-2:#EAEEE9;
  --ink:#121614; --ink-2:#4C5652; --ink-3:#79837E;
  --line:#D8DDD6; --line-strong:#BEC6BC;
  --accent:#1B6B4A; --accent-soft:#E1EFE7; --accent-ink:#125037;
  --amber:#8A6510; --amber-soft:#F6EEDB;
  --slate:#33566A; --slate-soft:#E4EDF2;
  --shadow:0 1px 2px rgba(18,22,20,.05), 0 8px 24px -18px rgba(18,22,20,.35);
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --ground:#0E1211; --surface:#161B19; --surface-2:#1D2422;
    --ink:#E6EBE7; --ink-2:#A3AFAA; --ink-3:#7C8884;
    --line:#28312E; --line-strong:#3A4441;
    --accent:#5CC08F; --accent-soft:#152A21; --accent-ink:#8AD9B1;
    --amber:#D9A441; --amber-soft:#2A2314;
    --slate:#8FB6C9; --slate-soft:#16242B;
    --shadow:0 1px 2px rgba(0,0,0,.4), 0 8px 24px -18px rgba(0,0,0,.8);
  }
}
:root[data-theme="dark"]{
  --ground:#0E1211; --surface:#161B19; --surface-2:#1D2422;
  --ink:#E6EBE7; --ink-2:#A3AFAA; --ink-3:#7C8884;
  --line:#28312E; --line-strong:#3A4441;
  --accent:#5CC08F; --accent-soft:#152A21; --accent-ink:#8AD9B1;
  --amber:#D9A441; --amber-soft:#2A2314;
  --slate:#8FB6C9; --slate-soft:#16242B;
  --shadow:0 1px 2px rgba(0,0,0,.4), 0 8px 24px -18px rgba(0,0,0,.8);
}
*{box-sizing:border-box}
body{margin:0; background:var(--ground); color:var(--ink);
  font-family:"Golos Text",-apple-system,"Segoe UI",Roboto,sans-serif; font-size:16px; line-height:1.62;}
.wrap{max-width:1120px; margin:0 auto; padding:0 24px 96px}
h1,h2,h3,h4{text-wrap:balance; margin:0}
.mono{font-family:"IBM Plex Mono",ui-monospace,Consolas,monospace}
a{color:var(--accent)}
.masthead{padding:64px 0 40px; border-bottom:1px solid var(--line-strong)}
.brandline{display:flex; flex-wrap:wrap; align-items:baseline; gap:14px; margin-bottom:28px}
.sigil{font-family:"Unbounded",sans-serif; font-weight:600; font-size:13px; letter-spacing:.12em;
  text-transform:uppercase; color:#FFFFFF; background:var(--accent); padding:5px 11px; border-radius:2px}
:root[data-theme="dark"] .sigil{color:#0E1211}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .sigil{color:#0E1211}}
.brandmeta{font-family:"IBM Plex Mono",monospace; font-size:12px; letter-spacing:.06em; color:var(--ink-3); text-transform:uppercase}
h1{font-family:"Unbounded",sans-serif; font-weight:600; letter-spacing:-.02em;
  font-size:clamp(30px,5.2vw,50px); line-height:1.08; max-width:20ch}
.dek{margin-top:22px; max-width:66ch; font-size:18px; color:var(--ink-2)}
section{padding-top:64px}
.sec-head{display:grid; grid-template-columns:150px minmax(0,1fr); gap:32px; align-items:start; margin-bottom:26px}
.sec-num{font-family:"IBM Plex Mono",monospace; font-size:12px; letter-spacing:.1em; text-transform:uppercase;
  color:var(--accent); padding-top:9px; border-top:2px solid var(--accent)}
h2{font-family:"Unbounded",sans-serif; font-weight:400; font-size:clamp(21px,2.7vw,29px); letter-spacing:-.015em; line-height:1.2}
.sec-body{display:grid; grid-template-columns:150px minmax(0,1fr); gap:32px}
.sec-body > .col{grid-column:2; min-width:0}
.lede{max-width:70ch; color:var(--ink-2)}
p{margin:0}
@media (max-width:860px){
  .sec-head,.sec-body{grid-template-columns:1fr; gap:14px}
  .sec-body > .col{grid-column:1}
  .sec-num{display:inline-block; border-top:none; border-left:2px solid var(--accent); padding:0 0 0 10px}
}
.clusters{display:flex; flex-direction:column; gap:22px}
.cluster{background:var(--surface); border:1px solid var(--line); border-radius:3px; box-shadow:var(--shadow); overflow:hidden}
.cl-top{display:flex; flex-wrap:wrap; gap:10px 14px; align-items:center; padding:15px 20px;
  border-bottom:1px solid var(--line); background:var(--surface-2)}
.cl-id{font-family:"IBM Plex Mono",monospace; font-size:12px; color:var(--surface); background:var(--ink); padding:3px 8px; border-radius:2px}
.cl-name{font-weight:700; font-size:17px; flex:1 1 240px; line-height:1.3}
.cl-url{font-family:"IBM Plex Mono",monospace; font-size:12.5px; color:var(--slate); background:var(--slate-soft); padding:3px 8px; border-radius:2px; overflow-wrap:anywhere}
.chip{font-family:"IBM Plex Mono",monospace; font-size:11px; letter-spacing:.06em; text-transform:uppercase;
  padding:3px 8px; border-radius:2px; white-space:nowrap}
.p1{background:var(--accent); color:#FFFFFF}
:root[data-theme="dark"] .p1{color:#0E1211}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .p1{color:#0E1211}}
.p2{background:var(--accent-soft); color:var(--accent-ink); border:1px solid var(--accent)}
.cl-body{padding:4px 20px 22px}
h4.mini{font-family:"IBM Plex Mono",monospace; font-size:11px; letter-spacing:.09em; text-transform:uppercase;
  color:var(--ink-3); font-weight:500; margin:26px 0 10px; padding-bottom:6px; border-bottom:1px solid var(--line)}
.meta{font-size:14.5px; color:var(--ink-2); max-width:80ch}
.meta b{font-family:"IBM Plex Mono",monospace; font-size:12px; color:var(--accent); text-transform:uppercase; letter-spacing:.05em}
.h1demo{font-family:"Unbounded",sans-serif; font-size:clamp(19px,2.4vw,25px); line-height:1.2; letter-spacing:-.015em; margin-bottom:12px}
.scroll{overflow-x:auto}
table{width:100%; border-collapse:collapse; font-size:14.5px}
th,td{text-align:left; padding:9px 14px 9px 0; border-bottom:1px solid var(--line); vertical-align:top}
th{font-family:"IBM Plex Mono",monospace; font-size:11px; letter-spacing:.07em; text-transform:uppercase; color:var(--ink-3); font-weight:500; white-space:nowrap}
td.num{font-variant-numeric:tabular-nums; white-space:nowrap; color:var(--ink-2)}
td.kw{font-weight:500}
tbody tr:last-child td{border-bottom:none}
.panel{background:var(--surface); border:1px solid var(--line); border-radius:3px; padding:2px 18px; margin-top:6px}
.cl-body .panel{box-shadow:none; background:var(--surface-2); border-color:var(--line)}
.cl-body .panel td, .cl-body .panel th{border-color:var(--line-strong)}
ul.ticks{list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:9px; max-width:78ch}
ul.ticks li{padding-left:24px; position:relative; color:var(--ink-2)}
ul.ticks li::before{content:"—"; position:absolute; left:0; color:var(--accent); font-weight:600}
ul.ticks li b{color:var(--ink)}
.packs{display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:1px; background:var(--line); border:1px solid var(--line)}
.pack{background:var(--surface-2); padding:16px 18px}
.pack-name{font-weight:700; font-size:15px}
.pack-price{font-family:"Unbounded",sans-serif; font-size:20px; color:var(--accent); margin:6px 0 2px; letter-spacing:-.02em}
.pack-term{font-family:"IBM Plex Mono",monospace; font-size:11.5px; color:var(--ink-3); text-transform:uppercase; letter-spacing:.06em}
.pack ul{margin:12px 0 0; padding-left:18px; font-size:14px; color:var(--ink-2); display:flex; flex-direction:column; gap:5px}
.faq{margin:0; display:flex; flex-direction:column; gap:14px; max-width:80ch}
.faq dt{font-weight:600; margin-bottom:4px}
.faq dd{margin:0; color:var(--ink-2); font-size:15px}
.note{margin-top:22px; font-size:14.5px; color:var(--ink-2); border-left:2px solid var(--accent); padding-left:14px}
code{font-family:"IBM Plex Mono",monospace; font-size:.88em; background:var(--surface-2); padding:1px 5px; border-radius:2px}
.warn{background:var(--amber-soft); border:1px solid var(--amber); border-radius:3px; padding:18px 22px; margin-top:20px}
.warn h4{font-size:15px; margin-bottom:8px}
.warn p{color:var(--ink-2); font-size:15px; max-width:74ch}
.steps{display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1px; background:var(--line); border:1px solid var(--line); margin-top:18px}
.step{background:var(--surface); padding:18px 20px}
.step .mono{font-size:11px; letter-spacing:.09em; text-transform:uppercase; color:var(--accent); display:block; margin-bottom:8px}
.step h4{font-size:16px; margin-bottom:8px}
.step p{font-size:14.5px; color:var(--ink-2)}
.toc{display:flex; flex-wrap:wrap; gap:8px; margin-top:18px}
.toc a{font-family:"IBM Plex Mono",monospace; font-size:12px; text-decoration:none; color:var(--ink-2);
  border:1px solid var(--line-strong); border-radius:2px; padding:5px 9px}
.toc a:hover{border-color:var(--accent); color:var(--accent)}
footer{margin-top:76px; padding-top:24px; border-top:1px solid var(--line-strong); font-size:14px; color:var(--ink-3); max-width:74ch}
</style>

<div class="wrap">
<header class="masthead">
  <div class="brandline">
    <span class="sigil">Верста</span>
    <span class="brandmeta">Тексты и цены · этап 2 из 3</span>
  </div>
  <h1>Тексты сайта и прайс студии «Верста»</h1>
  <p class="dek">Готовый копирайтинг для главной, ${services.length} страниц услуг, раздела «О студии» и контактов. Цены выставлены на 15–25 % ниже среднего по рынку Москвы. Всё содержимое лежит в <code>content/*.json</code> и на этапе 3 подставляется в Next.js напрямую — документ собран из тех же файлов, поэтому разъехаться они не могут.</p>
  <div class="toc">
    ${services.map((s) => `<a href="#${s.slug}">${esc(s.nav)}</a>`).join("\n    ")}
  </div>
</header>

<section>
  <div class="sec-head"><div class="sec-num">01 · Прайс</div><h2>Цены и позиционирование по стоимости</h2></div>
  <div class="sec-body"><div class="col">
    <p class="lede">${esc(site.pricing.policy)}</p>
    ${table(
      ["Услуга", "Наша цена", "Средняя по рынку", "Что входит"],
      rows(
        site.pricing.table.map(
          (r) =>
            `<tr><td class="kw">${esc(r.service)}</td><td class="num"><b>${esc(r.price)}</b></td><td class="num" style="color:var(--ink-3)">${esc(r.market)}</td><td>${esc(r.note)}</td></tr>`
        )
      ),
      760
    )}
    <div class="warn">
      <h4>Откуда взяты рыночные ориентиры</h4>
      <p>${esc(site.pricing.sources)} Средний сегмент Москвы держит 2 500–3 500 ₽ за час, средний чек индивидуальной разработки — 150 000–500 000 ₽. Наша ставка 2 400 ₽ ставит нас чуть ниже нижней границы среднего сегмента: дешевле студий, но заметно дороже фриланса — это сознательное место на рынке, а не демпинг.</p>
    </div>
    <h4 class="mini">Условия работы (блок повторяется на всех страницах услуг)</h4>
    <ul class="ticks">${site.pricing.conditions.map((c) => `<li>${esc(c)}</li>`).join("\n")}</ul>
  </div></div>
</section>

<section>
  <div class="sec-head"><div class="sec-num">02 · Главная</div><h2>Тексты главной страницы</h2></div>
  <div class="sec-body"><div class="col">
    <h4 class="mini">Первый экран</h4>
    <p class="h1demo">${esc(site.home.hero.h1)}</p>
    <p class="lede">${esc(site.home.hero.sub)}</p>
    <p class="note">Кнопки: <b>${esc(site.home.hero.cta)}</b> · ${esc(site.home.hero.ctaSecondary)}<br>Строка доверия под кнопками: ${esc(site.home.hero.trust)}</p>

    <h4 class="mini">Три направления работы</h4>
    <ul class="ticks">${site.home.pitch.map((p) => `<li><b>${esc(p.t)}.</b> ${esc(p.d)}</li>`).join("\n")}</ul>

    <h4 class="mini">Почему мы</h4>
    <ul class="ticks">${site.home.why.map((p) => `<li><b>${esc(p.t)}.</b> ${esc(p.d)}</li>`).join("\n")}</ul>

    <h4 class="mini">Процесс одной строкой</h4>
    <p class="lede">${esc(site.home.processTeaser)}</p>

    ${faqBlock(site.home.faq)}

    <h4 class="mini">Финальный призыв</h4>
    <p class="h1demo">${esc(site.home.finalCta.t)}</p>
    <p class="lede">${esc(site.home.finalCta.d)}</p>
  </div></div>
</section>

<section>
  <div class="sec-head"><div class="sec-num">03 · Услуги</div><h2>${services.length} посадочных страниц</h2></div>
  <div class="sec-body"><div class="col">
    <p class="lede" style="margin-bottom:22px">Каждая страница собрана по шаблону из этапа 1: первый экран с ключом в H1, конкретика в первом абзаце, состав услуги, цены пакетами, процесс по шагам, FAQ под разметку <code>FAQPage</code> и перелинковка на смежные услуги.</p>
    <div class="clusters">
      ${services.map(serviceCard).join("\n")}
    </div>
  </div></div>
</section>

<section>
  <div class="sec-head"><div class="sec-num">04 · Студия</div><h2>О студии и процесс работы</h2></div>
  <div class="sec-body"><div class="col">
    <p class="lede">${esc(site.about.lead)}</p>
    <h4 class="mini">Принципы</h4>
    <ul class="ticks">${site.about.principles.map((p) => `<li><b>${esc(p.t)}.</b> ${esc(p.d)}</li>`).join("\n")}</ul>
    <h4 class="mini">Процесс</h4>
    <div class="steps">
      ${site.about.process
        .map(
          (p) =>
            `<div class="step"><span class="mono">${esc(p.step)} · ${esc(p.dur)}</span><h4>${esc(p.t)}</h4><p>${esc(p.d)}</p></div>`
        )
        .join("\n")}
    </div>
    <div class="warn">
      <h4>Чего на сайте не будет</h4>
      <p>Ни выдуманной численности штата, ни чужих логотипов в портфолио, ни разметки отзывов на несуществующих отзывах. Страница «О студии» написана так, что в ней нет ни одного проверяемого утверждения о фактах, которых нет: только принципы работы и процесс. Раздел «Кейсы» и «Отзывы» наполняются после первых реальных проектов — до этого их просто нет в навигации.</p>
    </div>
  </div></div>
</section>

<section>
  <div class="sec-head"><div class="sec-num">05 · Заявки</div><h2>Форма и контакты</h2></div>
  <div class="sec-body"><div class="col">
    <p class="lede">${esc(site.contacts.lead)}</p>
    ${table(
      ["Поле", "Подпись", "Тип", "Обязательное"],
      rows(
        site.contacts.form.fields.map(
          (f) =>
            `<tr><td class="kw"><code>${esc(f.name)}</code></td><td>${esc(f.label)}</td><td class="num">${esc(f.type)}</td><td class="num">${f.required ? "да" : "нет"}</td></tr>`
        )
      ),
      560
    )}
    <p class="note"><b>Кнопка:</b> ${esc(site.contacts.form.submit)}<br><b>Успех:</b> ${esc(site.contacts.form.success)}<br><b>Ошибка:</b> ${esc(site.contacts.form.error)}</p>
    <h4 class="mini">Требования к форме на этапе 3</h4>
    <ul class="ticks">
      <li><b>Четыре поля, из них три обязательных.</b> Каждое лишнее поле снимает часть заявок, а телефон и имя можно спросить в ответном письме.</li>
      <li><b>Валидация на сервере,</b> а не только в браузере: клиентская проверка обходится за десять секунд.</li>
      <li><b>Скрытое поле-ловушка и ограничение частоты отправки по IP</b> вместо капчи — боты отсеиваются, живые люди не страдают.</li>
      <li><b>Уведомление на почту и в Telegram одновременно,</b> плюс запись в базу: письмо может уйти в спам, заявка не должна потеряться.</li>
      <li><b>Обязательный чекбокс согласия</b> со ссылкой на политику конфиденциальности, страница политики, хранение данных на серверах в РФ — требования 152-ФЗ.</li>
      <li><b>Отдельная цель в Метрике на каждую форму,</b> чтобы видеть, какая страница приносит заявки, а какая только трафик.</li>
    </ul>
  </div></div>
</section>

<footer>
  Собрано автоматически из <code>content/site.json</code>, <code>content/services-build.json</code> и <code>content/services-support.json</code> командой <code>node scripts/build-doc.mjs</code>. Правки вносятся в JSON, документ пересобирается. Контакты и реквизиты — заглушки, заменяются перед публикацией.
</footer>
</div>
`;

writeFileSync(join(root, "docs/copy.html"), html, "utf8");
console.log("docs/copy.html: " + html.length + " chars, " + services.length + " services");
