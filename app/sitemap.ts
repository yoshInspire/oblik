import type { MetadataRoute } from "next";
import { pages, sectionOf } from "@/lib/content";
import { absolute } from "@/lib/seo";

/**
 * Карта сайта собирается из реестра страниц: добавить страницу в контент —
 * значит добавить её в sitemap. Рассинхрон структурно невозможен.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Приоритет — по уровню и разделу: коммерческие услуги выше
  // информационных разборов и гео-страниц.
  const priorityFor = (url: string): number => {
    if (url === "/") return 1;
    const depth = url.split("/").filter(Boolean).length;
    const section = sectionOf(url);
    if (depth === 1) return 0.9;
    if (section === "uslugi") return depth === 2 ? 0.85 : 0.7;
    if (section === "tehnologii" || section === "otraslyam") return 0.65;
    if (section === "voprosy") return 0.55;
    if (section === "goroda") return 0.5;
    return 0.6;
  };

  const fromRegistry: MetadataRoute.Sitemap = pages.map((page) => ({
    url: absolute(page.url),
    lastModified: now,
    changeFrequency: "monthly",
    priority: priorityFor(page.url),
  }));

  const standalone: MetadataRoute.Sitemap = [
    { url: absolute("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absolute("/about/"), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: absolute("/contacts/"), lastModified: now, changeFrequency: "yearly", priority: 0.7 },
  ];

  return [...standalone, ...fromRegistry];
}
