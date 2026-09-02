import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Check, ChevronRight, Plus } from "lucide-react";
import { teaser, type Block, type Faq, type Page } from "@/lib/content";
import { pageIcon } from "@/lib/icons";
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
   Шапка секции и сетка секции
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
   Карточки
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

/** Карточка страницы: иконка, название, первое предложение подводки. */
export function PageCards({ items }: { items: Page[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((page, i) => {
        const Icon = pageIcon(page.id);
        return (
          <Reveal key={page.url} index={Math.min(i, 5)} className="h-full">
            <Spotlight className="group relative h-full">
              <Link href={page.url} className="card card-hover flex h-full flex-col overflow-hidden p-[22px]">
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
                  {page.nav}
                </h3>
                <p className="relative mt-2.5 flex-1 text-[15px] leading-[1.6] text-ink-2">
                  {teaser(page)}
                </p>
                <span className="link-quiet relative mt-5">Подробнее</span>
              </Link>
            </Spotlight>
          </Reveal>
        );
      })}
    </div>
  );
}

/** Плотный список страниц строками — для хабов и блоков «смежное». */
export function PageRows({ items }: { items: Page[] }) {
  return (
    <div className="grid gap-2.5">
      {items.map((page, i) => {
        const Icon = pageIcon(page.id);
        return (
          <Reveal key={page.url} index={Math.min(i, 6)}>
            <Link
              href={page.url}
              className="row-link grid-cols-1 gap-2 md:grid-cols-[20px_minmax(180px,1fr)_minmax(240px,1.8fr)_auto] md:gap-[clamp(12px,3vw,44px)]"
            >
              <Icon size={18} strokeWidth={1.9} className="shrink-0 text-ink-3" />
              <span className="font-display text-[16.5px] font-medium text-ink">{page.nav}</span>
              <span className="text-[14.5px] leading-[1.55] text-ink-2">{teaser(page)}</span>
              <ArrowUpRight size={16} className="shrink-0 text-ink-3" />
            </Link>
          </Reveal>
        );
      })}
    </div>
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

/* Шаги процесса: номер, полоса заполнения, название и описание */
const STEP_FILL = [22, 32, 64, 100, 40, 72];

export function Steps({ steps }: { steps: { t: string; d: string; dur?: string }[] }) {
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
              {step.dur || String(i + 1).padStart(2, "0")}
            </span>
            <span
              aria-hidden="true"
              className="mt-2.5 block h-px w-full"
              style={{
                background: last
                  ? "var(--accent)"
                  : `linear-gradient(to right, var(--accent) ${pct}%, var(--rule) ${pct}%)`,
              }}
            />
            <h3 className="mt-4 font-display text-[16.5px] font-medium text-ink">{step.t}</h3>
            <p className="mb-8 mt-2 text-[14.5px] leading-[1.6] text-ink-2">{step.d}</p>
          </Reveal>
        );
      })}
    </ol>
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

/* ------------------------------------------------------------------
   Примитивы под типы блоков контента
   ------------------------------------------------------------------ */

/** Простой перечень с галочками — «что входит». */
function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-x-10 gap-y-3 md:grid-cols-2">
      {items.map((item, i) => (
        <Reveal as="li" index={i % 2} key={item} className="flex gap-3 border-t border-rule pt-3">
          <Check size={15} className="mt-1 shrink-0 text-accent-hi" strokeWidth={2.4} />
          <span className="text-[14.5px] leading-[1.6] text-ink-2">{item}</span>
        </Reveal>
      ))}
    </ul>
  );
}

/** Нумерованный перечень признаков — «когда пора». */
function SignalList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-px overflow-hidden rounded-lg" style={{ background: "var(--rule)" }}>
      {items.map((item, i) => (
        <Reveal as="li" index={Math.min(i, 5)} key={item}>
          <span className="flex items-baseline gap-4 bg-[var(--surface)] px-5 py-4">
            <span className="font-mono text-[12.5px] text-accent-hi">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[15px] leading-[1.6] text-ink-2">{item}</span>
          </span>
        </Reveal>
      ))}
    </ul>
  );
}

/** Карточки-переходы на дочерние страницы. */
function BranchCards({ items }: { items: { t: string; d: string; href: string }[] }) {
  return (
    <div className="grid gap-2.5 md:grid-cols-2">
      {items.map((item, i) => (
        <Reveal key={item.href} index={Math.min(i, 5)} className="h-full">
          <Link href={item.href} className="card card-hover flex h-full flex-col p-5">
            <span className="flex items-center justify-between gap-4">
              <b className="font-display text-[16.5px] font-medium text-ink">{item.t}</b>
              <ArrowUpRight size={16} className="shrink-0 text-ink-3" />
            </span>
            <span className="mt-2 text-[14.5px] leading-[1.6] text-ink-2">{item.d}</span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

function Prose({ paras }: { paras: string[] }) {
  return (
    <div className="flex max-w-[68ch] flex-col gap-4">
      {paras.map((p, i) => (
        <Reveal index={Math.min(i, 3)} key={p.slice(0, 40)}>
          <p className="text-pretty text-[15.5px] leading-[1.7] text-ink-2">{p}</p>
        </Reveal>
      ))}
    </div>
  );
}

/**
 * Один блок контента. Тип блока задаёт и вид, и порядок на странице —
 * поэтому у разных страниц набор блоков разный и вёрстка не повторяется.
 */
export function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "pains":
    case "stack":
      return (
        <Section label={block.type === "stack" ? "Стек" : "Ситуации"} title={block.title} lead={block.lead}>
          <TickList items={block.items} />
        </Section>
      );
    case "steps":
      return (
        <Section label="Процесс" title={block.title} lead={block.lead}>
          <Steps steps={block.items} />
        </Section>
      );
    case "checklist":
    case "audience":
      return (
        <Section label="Состав" title={block.title} lead={block.lead}>
          <CheckList items={block.items} />
        </Section>
      );
    case "signals":
      return (
        <Section label="Признаки" title={block.title} lead={block.lead}>
          <SignalList items={block.items} />
        </Section>
      );
    case "branches":
      return (
        <Section label="Разделы" title={block.title} lead={block.lead}>
          <BranchCards items={block.items} />
        </Section>
      );
    case "prose":
      return (
        <Section label="Разбор" title={block.title}>
          <Prose paras={block.paras} />
        </Section>
      );
  }
}
