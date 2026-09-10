import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  // nodemailer тянет зависимости через динамический require — сборщик такое
  // ломает. Оставляем пакет внешним, чтобы его грузил родной require Node.
  serverExternalPackages: ["nodemailer"],
  poweredByHeader: false,
  // Единый формат адресов: со слешем на конце. Меняется один раз и навсегда —
  // смена формата после индексации порождает дубли.
  trailingSlash: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        /* Файлы из public/ Next по умолчанию отдаёт с max-age=0, и браузер
           тянет их заново на каждой странице. Имена у них стабильные —
           меняются только вместе с содержимым, так что кешируем надолго. */
        source: "/:file*.(png|jpg|jpeg|webp|avif|gif|svg|ico|woff|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default config;
