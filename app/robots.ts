import type { MetadataRoute } from "next";
import { absolute, BASE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/privacy/"],
      },
    ],
    sitemap: absolute("/sitemap.xml"),
    host: BASE_URL,
  };
}
