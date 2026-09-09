import type { MetadataRoute } from "next";
import { absolute, BASE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Политику конфиденциальности не закрываем: на неё ссылается согласие
        // в форме заявки, и Яндекс проверяет её наличие у коммерческих сайтов.
        // Закрытая роботсом страница выглядит как спрятанная.
        disallow: ["/api/"],
      },
    ],
    sitemap: absolute("/sitemap.xml"),
    host: BASE_URL,
  };
}
