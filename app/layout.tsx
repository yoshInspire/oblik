import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Header, Footer } from "@/components/Chrome";
import { JsonLd } from "@/components/Blocks";
import { SmoothScroll, ScrollProgress } from "@/components/motion";
import Backdrop from "@/components/Backdrop";
import { organizationLd, BASE_URL } from "@/lib/seo";
import { site } from "@/lib/content";
import "./globals.css";

const inter = Inter({
  subsets: ["cyrillic", "latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `Разработка сайтов и веб-сервисов в Москве — студия «${site.brand.name}»`,
    template: `%s — студия «${site.brand.name}»`,
  },
  description: site.brand.positioning,
  applicationName: `Студия «${site.brand.name}»`,
  formatDetection: { telephone: false },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0d18",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} antialiased`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-white"
        >
          Перейти к содержимому
        </a>
        <Backdrop />
        <SmoothScroll />
        <ScrollProgress />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <JsonLd data={organizationLd()} />
      </body>
    </html>
  );
}
