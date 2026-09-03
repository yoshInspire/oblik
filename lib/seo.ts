import type { Metadata } from "next";
import { site } from "./content";

export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://oblik.space";

export function absolute(path = "/"): string {
  return BASE_URL + path;
}

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
};

export function pageMeta({ title, description, path }: PageMetaInput): Metadata {
  const url = absolute(path);
  return {
    // absolute отключает шаблон из layout: заголовки заданы картой релевантности
    // целиком и уже уложены в 60 символов, дописывать к ним бренд нельзя.
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: `Студия «${site.brand.name}»`,
      locale: "ru_RU",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/** Организация — на всех страницах через layout. */
export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: `Студия «${site.brand.name}»`,
    description: site.brand.positioning,
    url: BASE_URL,
    email: site.brand.contacts.email,
    telephone: site.brand.contacts.phones,
    sameAs: site.brand.contacts.telegram.map(
      (nick) => `https://t.me/${nick.replace("@", "")}`,
    ),
    priceRange: "₽₽",
    areaServed: { "@type": "Country", name: "Россия" },
    address: {
      "@type": "PostalAddress",
      addressLocality: site.brand.city,
      addressCountry: "RU",
    },
    knowsAbout: [
      "разработка сайтов",
      "разработка интернет-магазинов",
      "доработка сайтов",
      "техническая поддержка сайтов",
      "интеграция с 1С",
    ],
  };
}

export function serviceLd(input: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: absolute(input.path),
    serviceType: input.name,
    provider: {
      "@type": "ProfessionalService",
      name: `Студия «${site.brand.name}»`,
      url: BASE_URL,
    },
    areaServed: { "@type": "Country", name: "Россия" },
    // Offer с ценой намеренно не размечаем: цены не публикуются,
    // а разметка с выдуманной суммой — прямой путь к санкциям.
  };
}

export function faqLd(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}
