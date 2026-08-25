import Link from "next/link";
import type { ReactNode } from "react";
import { Check, ChevronRight, Plus } from "lucide-react";
import { teaser, type Faq, type Pack, type Service, type Step } from "@/lib/content";
import { serviceIcon } from "@/lib/icons";
import { Reveal, Spotlight } from "@/components/motion";

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* ------------------------------------------------------------------
   Шапка секции: надзаголовок, заголовок, подводка и ссылка.
   Стоит отдельной колонкой слева от содержимого.
   ------------------------------------------------------------------ */

export function SectionHead({
  label,
  title,
  lead,
  link,
  align = "left",
}: {
  label?: string;
  title: ReactNode;
  lead?: string;
  link?: { href: string; text: string };
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-[54ch] text-center" : ""}>
      {label && <span className="label block text-ink-3">{label}</span>}
      <h2 className="mt-3.5 text-[clamp(26px,2.4vw,34px)] leading-[1.15] text-ink">{title}</h2>
      {lead && (
        <p className="mt-[18px] max-w-[40ch] text-pretty text-[15.5px] leading-[1.6] text-ink-2">
          {lead}
        </p>
      )}
      {link && (
        <Link href={link.href} className="link-line mt-[18px]">
          {link.text}
        </Link>
      )}
    </div>
  );
}

/** Секция макета: шапка слева, содержимое справа. */
export function Section({
  label,
  title,
  lead,
  link,
  children,
  id,
}: {
  label?: string;
  title: ReactNode;
  lead?: string;
  link?: { href: string; text: string };
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="shell grid gap-x-[clamp(28px,4vw,64px)] gap-y-7 py-[clamp(36px,4vw,60px)] lg:grid-cols-[minmax(220px,290px)_1fr]"
    >
      <Reveal>
        <SectionHead label={label} title={title} lead={lead} link={link} />
      </Reveal>
      <div>{children}</div>
    </section>
  );
}

export function Breadcrumbs({ trail }: { trail: { name: string; path: string }[] }) {
  return (
    <nav
      className="shell flex flex-wrap items-center gap-1.5 pt-8 font-mono text-[12px] tracking-[0.06em] text-ink-3"
      aria-label="Хлебные крошки"
    >
      {trail.map((item, i) => (
        <span key={item.path} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={13} className="text-ink-3" aria-hidden="true" />}
          {i === trail.length - 1 ? (
            <span className="text-ink-2">{item.name}</span>
          ) : (
            <Link href={item.path} className="transition-colors hover:text-accent-hi">
              {item.name}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------------
   Карточки направлений: иконка, заголовок, текст, ссылка внизу
   ------------------------------------------------------------------ */

export function PitchCards({
  items,
}: {
  items: { icon: ReactNode; title: string; text: string; href: string; linkText?: string }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <Reveal key={item.title} index={i} className="h-full">
          <div className="card card-hover flex h-full flex-col p-[22px]">
            <span className="text-accent-hi">{item.icon}</span>
            <h3 className="mt-[18px] font-display text-[18px] font-semibold text-ink">
              {item.title}
            </h3>
            <p className="mt-2.5 flex-1 text-[15px] leading-[1.6] text-ink-2">{item.text}</p>
            <Link href={item.href} className="link-quiet mt-5">
              {item.linkText ?? "Подробнее"}
            </Link>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/* Перечень услуг в три колонки: тонкая линия сверху и иконка у названия */
export function ServiceList({ items }: { items: Service[] }) {
  return (
    <ul className="grid gap-x-[clamp(20px,3vw,40px)] sm:grid-cols-2 lg:grid-cols-3">
      {items.map((service) => {
        const Icon = serviceIcon(service.slug);
        return (
          <li key={service.slug} className="border-t border-rule">
            <Link
              href={`/uslugi/${service.slug}/`}
              className="flex items-center gap-3 py-[13px] text-[15.5px] text-ink-2 transition-colors hover:text-ink"
            >
              <Icon size={17} strokeWidth={1.9} className="shrink-0 text-ink-3" />
              <span>{service.nav}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/* Цитата: акцентная грань слева и кнопка справа */
export function QuotePanel({
  children,
  href,
  action = "Обсудить задачу",
}: {
  children: ReactNode;
  href?: string;
  action?: string;
}) {
  return (
    <Reveal>
      <div
        className="card flex flex-wrap items-center gap-8 p-[clamp(26px,3vw,38px)]"
        style={{ borderLeft: "2px solid var(--accent)" }}
      >
        <blockquote className="flex-1 font-display text-[clamp(19px,1.8vw,25px)] font-medium leading-[1.4] tracking-[-0.02em] text-ink">
          {children}
        </blockquote>
        {href && (
          <Link href={href} className="btn btn-outline shrink-0 px-[22px] py-3 text-[15px]">
            {action}
          </Link>
        )}
      </div>
    </Reveal>
  );
}

/* Шаги процесса: срок, полоса заполнения, название и описание */
const STEP_FILL = [22, 32, 64, 100, 40, 72];

export function Steps({ steps }: { steps: Step[] }) {
  return (
    <ol className="flex flex-wrap items-stretch">
      {steps.map((step, i) => {
        const pct = STEP_FILL[i] ?? 50;
        const last = i === steps.length - 1;
        return (
          <Reveal
            as="li"
            key={step.t}
            index={Math.min(i, 5)}
            className="w-full min-w-[220px] pr-[clamp(14px,1.6vw,26px)] sm:w-1/2 lg:w-1/4"
          >
            <span className="block min-h-5 font-mono text-[12.5px] tracking-[0.06em] text-accent-hi">
              {step.dur}
            </span>
            <span
              aria-hidden="true"
              className="mt-2.5 block h-[3px] rounded-[2px]"
              style={{
                background: `linear-gradient(to right, ${
                  last ? "rgba(233,237,255,.4)" : "var(--accent)"
                } ${pct}%, rgba(233,237,255,.14) ${pct}%)`,
              }}
            />
            <h3 className="mt-4 font-display text-[16.5px] font-medium text-ink">{step.t}</h3>
            <p className="mt-2 text-[14.5px] leading-[1.6] text-ink-2">{step.d}</p>
          </Reveal>
        );
      })}
    </ol>
  );
}

/* Карточки цен: услуга и сумма в строку, под ними состав и рыночная цена */
export function PriceCards({
  rows,
}: {
  rows: { service: string; price: string; market: string; note: string }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map((row, i) => (
        <Reveal key={row.service} index={i} className="h-full">
          <div className="card grid h-full grid-cols-[1fr_auto] items-baseline gap-x-5 gap-y-2 px-[22px] py-5">
            <span className="text-[16px] font-medium text-ink">{row.service}</span>
            <span className="whitespace-nowrap text-right font-display text-[22px] font-semibold tracking-[-0.02em] text-ink">
              {row.price}
            </span>
            <p className="col-start-1 max-w-[34ch] text-[14.5px] leading-[1.55] text-ink-3">
              {row.note}
            </p>
            <span
              className="col-start-2 whitespace-nowrap text-right font-mono text-[12.5px] text-ink-3"
              style={{
                textDecoration: "line-through",
                textDecorationThickness: "1px",
                textDecorationColor: "color-mix(in srgb, var(--ink-3) 55%, transparent)",
              }}
            >
              {row.market}
            </span>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------
   Услуги на внутренних страницах
   ------------------------------------------------------------------ */

export function ServiceRows({ items }: { items: Service[] }) {
  return (
    <div className="grid gap-2.5">
      {items.map((service, i) => {
        const Icon = serviceIcon(service.slug);
        return (
          <Reveal key={service.slug} index={Math.min(i, 6)}>
            <Link
              href={`/uslugi/${service.slug}/`}
              className="row-link grid-cols-1 gap-2 md:grid-cols-[20px_minmax(160px,1fr)_minmax(220px,1.6fr)_auto] md:gap-[clamp(12px,3vw,44px)]"
            >
              <Icon size={18} strokeWidth={1.9} className="shrink-0 text-ink-3" />
              <span className="font-display text-[16.5px] font-medium text-ink">{service.nav}</span>
              <span className="text-[14.5px] leading-[1.55] text-ink-2">{teaser(service)}</span>
              <span className="whitespace-nowrap font-mono text-[13px] text-accent-hi">
                {service.priceFrom}
              </span>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}

export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  const Icon = serviceIcon(service.slug);

  return (
    <Reveal index={index} className="h-full">
      <Spotlight className="group relative h-full">
        <Link
          href={`/uslugi/${service.slug}/`}
          className="card card-hover flex h-full flex-col overflow-hidden p-[22px]"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(340px circle at var(--mx) var(--my), color-mix(in srgb, var(--accent) 14%, transparent), transparent 70%)",
            }}
          />
          <Icon size={20} strokeWidth={1.9} className="relative text-accent-hi" />
          <h3 className="relative mt-[18px] font-display text-[18px] font-semibold text-ink">
            {service.nav}
          </h3>
          <p className="relative mt-2.5 flex-1 text-[15px] leading-[1.6] text-ink-2">
            {teaser(service)}
          </p>
          <span className="relative mt-5 flex items-center justify-between">
            <span className="font-mono text-[13px] text-accent-hi">{service.priceFrom}</span>
            <span className="link-quiet">Подробнее</span>
          </span>
        </Link>
      </Spotlight>
    </Reveal>
  );
}

export function Packages({ packs }: { packs: Pack[] }) {
  const heroIndex = packs.length > 2 ? 1 : 0;

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {packs.map((pack, i) => {
        const hero = i === heroIndex;
        return (
          <Reveal key={pack.name} index={i} className="h-full">
            <div
              className={`card flex h-full flex-col p-[22px] ${hero ? "" : "card-hover"}`}
              style={hero ? { borderColor: "color-mix(in srgb, var(--accent) 70%, transparent)" } : undefined}
            >
              {hero && (
                <span className="label absolute right-5 top-5 rounded-md bg-accent px-2.5 py-1 text-white">
                  Чаще берут
                </span>
              )}
              <span className="label text-ink-3">{pack.name}</span>
              <span className="mt-3 font-display text-[24px] font-semibold tracking-[-0.02em] text-ink">
                {pack.price}
              </span>
              <span className="font-mono text-[12.5px] text-ink-3">{pack.term}</span>

              <ul className="mt-5 flex flex-col gap-2.5 text-[14.5px] text-ink-2">
                {pack.items.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <Check size={15} className="mt-1 shrink-0 text-accent-hi" strokeWidth={2.4} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

/* Аккордеон на <details>: работает без JavaScript и доступен с клавиатуры */
export function FaqList({ faq }: { faq: Faq[] }) {
  return (
    <div className="flex flex-col">
      {faq.map((item) => (
        <details key={item.q} className="group border-t border-rule">
          <summary className="flex cursor-pointer list-none items-center gap-5 py-[15px] text-[16px] text-ink transition-colors hover:text-accent-hi">
            <span className="flex-1">{item.q}</span>
            <span className="h-5 w-5 shrink-0 text-ink-3 transition-transform duration-300 group-open:rotate-45">
              <Plus size={18} strokeWidth={2} />
            </span>
          </summary>
          <p className="max-w-[68ch] pb-[18px] pr-10 text-[15px] leading-[1.65] text-ink-2">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}

export function TickList({ items }: { items: { t: string; d: string }[] }) {
  return (
    <ul className="grid gap-x-10 gap-y-6 md:grid-cols-2">
      {items.map((item, i) => (
        <Reveal as="li" index={i % 2} key={item.t} className="flex gap-3">
          <Check size={16} className="mt-1 shrink-0 text-accent-hi" strokeWidth={2.4} />
          <span>
            <b className="font-semibold text-ink">{item.t}</b>
            <span className="mt-1.5 block text-[14.5px] leading-[1.6] text-ink-2">{item.d}</span>
          </span>
        </Reveal>
      ))}
    </ul>
  );
}
