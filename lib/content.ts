import siteJson from "@/content/site.json";
import corePages from "@/content/pages/core.json";
import uslugiPages from "@/content/pages/uslugi.json";
import uslugiPages2 from "@/content/pages/uslugi-2.json";
import uslugiL3a from "@/content/pages/uslugi-l3-a.json";
import uslugiL3b from "@/content/pages/uslugi-l3-b.json";
import uslugiL3c from "@/content/pages/uslugi-l3-c.json";
import tehnologiiPages from "@/content/pages/tehnologii.json";
import otraslyamPages from "@/content/pages/otraslyam.json";
import voprosyPages from "@/content/pages/voprosy.json";
import gorodaPages from "@/content/pages/goroda.json";

export type Faq = { q: string; a: string };

export type Block =
  | { type: "pains" | "steps" | "stack"; title: string; lead?: string; items: { t: string; d: string }[] }
  | { type: "branches"; title: string; lead?: string; items: { t: string; d: string; href: string }[] }
  | { type: "checklist" | "signals" | "audience"; title: string; lead?: string; items: string[] }
  | { type: "prose"; title: string; paras: string[] };

export type Group = { title: string; lead?: string; urls: string[] };

export type Page = {
  /** Канонический адрес со слешем на конце. Он же ключ во всей системе. */
  url: string;
  id: string;
  nav: string;
  parent?: string;
  /** hub — страница-раздел: вместо блоков выводит сгруппированные ссылки. */
  type?: "hub";
  h1: string;
  title: string;
  description: string;
  lead: string[];
  blocks?: Block[];
  groups?: Group[];
  faq?: Faq[];
  related?: string[];
  cta: { t: string; d: string };
};

export const site = siteJson;

/**
 * Единый реестр страниц. Каждый файл — пачка контента, собранная за один заход;
 * порядок внутри реестра не важен, навигация строится по url и parent.
 */
export const pages: Page[] = [
  ...(corePages as unknown as Page[]),
  ...(uslugiPages as unknown as Page[]),
  ...(uslugiPages2 as unknown as Page[]),
  ...(uslugiL3a as unknown as Page[]),
  ...(uslugiL3b as unknown as Page[]),
  ...(uslugiL3c as unknown as Page[]),
  ...(tehnologiiPages as unknown as Page[]),
  ...(otraslyamPages as unknown as Page[]),
  ...(voprosyPages as unknown as Page[]),
  ...(gorodaPages as unknown as Page[]),
];

const byUrl = new Map(pages.map((p) => [p.url, p]));

export function getPage(url: string): Page | undefined {
  return byUrl.get(url);
}

/** Страницы, лежащие непосредственно под указанным адресом. */
export function childrenOf(url: string): Page[] {
  return pages.filter((p) => p.parent === url);
}

/** Раздел первого уровня: "/uslugi/foo/bar/" → "uslugi". */
export function sectionOf(url: string): string {
  return url.split("/").filter(Boolean)[0] ?? "";
}

export function pagesInSection(section: string): Page[] {
  return pages.filter((p) => sectionOf(p.url) === section && p.url !== `/${section}/`);
}

export function resolve(urls: string[] = []): Page[] {
  return urls.map((u) => byUrl.get(u)).filter((p): p is Page => Boolean(p));
}

/**
 * Хлебные крошки строятся по вложенности адреса, а не по отдельному полю:
 * так они не разъезжаются с реальной структурой при добавлении страниц.
 */
export function trailFor(page: Page): { name: string; path: string }[] {
  const trail = [{ name: "Главная", path: "/" }];
  const parts = page.url.split("/").filter(Boolean);
  let acc = "";
  for (const part of parts) {
    acc += `/${part}`;
    const found = byUrl.get(`${acc}/`);
    if (found && found.url !== page.url) trail.push({ name: found.nav, path: found.url });
  }
  trail.push({ name: page.nav, path: page.url });
  return trail;
}

/** Короткий тизер для карточки: первое предложение вводного абзаца. */
export function teaser(page: Page): string {
  const first = page.lead[0] ?? "";
  const cut = first.split(". ")[0];
  return cut.endsWith(".") ? cut : cut + ".";
}
