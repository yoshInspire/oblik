import type { MetadataRoute } from "next";
import { services } from "@/lib/content";
import { absolute } from "@/lib/seo";

/**
 * Карта сайта генерируется из того же источника, что и страницы,
 * поэтому не может рассинхронизироваться с реальной структурой.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absolute("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absolute("/uslugi/"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absolute("/price/"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absolute("/about/"), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: absolute("/contacts/"), lastModified: now, changeFrequency: "yearly", priority: 0.7 },
  ];

  const servicePages: MetadataRoute.Sitemap = services.map((service) => ({
    url: absolute(`/uslugi/${service.slug}/`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...servicePages];
}
