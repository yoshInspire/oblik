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
