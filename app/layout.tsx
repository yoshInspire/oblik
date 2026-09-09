import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
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
  verification: { yandex: "4b4acb15f8e6186e" },
};

/** Счётчик Яндекс.Метрики. Номер публичный, прятать его смысла нет. */
const METRIKA_ID = 112432844;

export const viewport: Viewport = {
  themeColor: "#0b0d18",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} antialiased`}>
      <body>
        {/* Блоки приезжают по появлению в окне, и до запуска скрипта они
            лежат в разметке с opacity: 0. Без JS это пустая страница —
            возвращаем содержимое на место. */}
        <noscript>
          <style>{`[style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
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

        {/* Метрика грузится после гидратации: счётчик не должен задерживать
            отрисовку и попадать в измерение скорости первого экрана. */}
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}', 'ym');
          ym(${METRIKA_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`}
        </Script>
        <noscript>
          <div>
            <img
              src={`https://mc.yandex.ru/watch/${METRIKA_ID}`}
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
      </body>
    </html>
  );
}
