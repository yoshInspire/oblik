import siteJson from "@/content/site.json";
import buildServices from "@/content/services-build.json";
import supportServices from "@/content/services-support.json";

export type Faq = { q: string; a: string };
export type Pack = { name: string; price: string; term: string; items: string[] };
export type Step = { t: string; d: string; dur: string };

export type Service = {
  slug: string;
  cluster: string;
  nav: string;
  title: string;
  h1: string;
  description: string;
  priceFrom: string;
  term: string;
  lead: string;
  includes: { t: string; d: string }[];
  packages: Pack[];
  process: Step[];
  faq: Faq[];
  related: string[];
};

export const site = siteJson;

/**
 * Порядок важен: он же порядок карточек на главной и в карте сайта.
 * Первыми идут услуги первой волны продвижения — они приоритетнее по трафику.
 */
export const services: Service[] = [
  ...(supportServices as Service[]),
  ...(buildServices as Service[]),
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function relatedServices(slugs: string[]): Service[] {
  return slugs
    .map((slug) => getService(slug))
    .filter((s): s is Service => Boolean(s));
}

/** Короткое описание для карточки: первое предложение вводного абзаца. */
export function teaser(service: Service): string {
  const sentences = service.lead.split(". ");
  const short = sentences.slice(0, 2).join(". ");
  return short.endsWith(".") ? short : short + ".";
}
