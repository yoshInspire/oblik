import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { childrenOf, teaser } from "@/lib/content";
import { pageIcon } from "@/lib/icons";

export const metadata = {
  title: "Страница не найдена",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="shell py-[clamp(50px,10vh,130px)]">
      <span className="block font-display text-[clamp(80px,16vw,220px)] font-semibold leading-none tracking-[-0.06em] text-ink opacity-20">
        404
      </span>

      <h1 className="mt-2 max-w-[16ch] text-[clamp(32px,5.4vw,72px)] font-semibold leading-[0.96] tracking-[-0.05em] text-ink">
        Такой страницы нет
      </h1>
      <p className="mt-7 max-w-[52ch] text-[clamp(15px,1.05vw,17px)] leading-[1.7] text-ink-2 text-pretty">
        Возможно, адрес набран с опечаткой или страницу переименовали. Вот куда можно пойти
        вместо неё.
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link href="/uslugi/" className="btn btn-primary">
          Все услуги
          <ArrowUpRight size={17} strokeWidth={2.2} />
        </Link>
        <Link href="/contacts/" className="btn btn-outline">
          Написать нам
        </Link>
      </div>

      <div className="mt-16 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {childrenOf("/uslugi/").slice(0, 6).map((service) => {
          const Icon = pageIcon(service.id);
          return (
            <Link
              key={service.url}
              href={service.url}
              className="card group flex items-center gap-4 p-6 hover:border-accent/50 hover:bg-surface-2"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-wash text-accent-hi">
                <Icon size={18} strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-ink">{service.nav}</span>
                <span className="block truncate text-[12.5px] text-ink-3">{teaser(service)}</span>
              </span>
              <ArrowUpRight
                size={16}
                className="shrink-0 text-ink-3 transition-all group-hover:translate-x-0.5 group-hover:text-accent-hi"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
