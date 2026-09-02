import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import {
  childrenOf,
  getPage,
  pages,
  resolve,
  trailFor,
  type Page,
} from "@/lib/content";
import { breadcrumbLd, faqLd, pageMeta, serviceLd } from "@/lib/seo";
import LeadForm from "@/components/LeadForm";
import { Reveal } from "@/components/motion";
import {
  BlockView,
  Breadcrumbs,
  FaqList,
  JsonLd,
  PageCards,
  PageRows,
  Section,
} from "@/components/Blocks";

type Params = { slug: string[] };

/**
 * Все страницы раздела рендерит один маршрут: контент лежит в реестре,
 * а не в файлах роутинга. Добавить страницу — значит добавить объект в JSON.
 */
export async function generateStaticParams(): Promise<Params[]> {
  return pages
    .filter((p) => p.url !== "/")
    .map((p) => ({ slug: p.url.split("/").filter(Boolean) }));
}

function urlFrom(slug: string[]): string {
  return `/${slug.join("/")}/`;
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const page = getPage(urlFrom(slug));
  if (!page) return {};
  return pageMeta({ title: page.title, description: page.description, path: page.url });
}

export default async function ContentPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const page = getPage(urlFrom(slug));
  if (!page) notFound();

  const kids = childrenOf(page.url);
  const related = resolve(page.related);
  const trail = trailFor(page);

  return (
    <>
      <Breadcrumbs trail={trail} />

      {/* ================= ЗАГОЛОВОК ================= */}
      <section className="shell grid gap-x-[clamp(28px,4vw,64px)] gap-y-6 pb-[clamp(20px,3vw,36px)] pt-[clamp(24px,4vh,52px)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <h1
          className="max-w-[18ch] text-[clamp(30px,4.4vw,58px)] font-medium leading-[1.04] tracking-[-0.035em] text-ink"
          style={{ animation: "vUp .9s cubic-bezier(.16,1,.3,1) .05s both" }}
        >
          {page.h1}
        </h1>
        <div
          className="flex flex-col gap-4 self-end"
          style={{ animation: "vIn .8s .25s both" }}
        >
          {page.lead.map((para) => (
            <p key={para.slice(0, 40)} className="text-pretty text-[16px] leading-[1.65] text-ink-2">
              {para}
            </p>
          ))}
          <Link href="#lead" className="link-line mt-1 self-start">
            Обсудить задачу
          </Link>
        </div>
      </section>

      {/* ================= РАЗДЕЛЫ ХАБА ================= */}
      {page.groups?.map((group) => {
        const items = resolve(group.urls);
        if (items.length === 0) return null;
        return (
          <Section key={group.title} label="Раздел" title={group.title} lead={group.lead}>
            {items.length > 4 ? <PageRows items={items} /> : <PageCards items={items} />}
          </Section>
        );
      })}

      {/* ================= БЛОКИ КОНТЕНТА ================= */}
      {page.blocks?.map((block, i) => <BlockView key={`${block.type}-${i}`} block={block} />)}

      {/* ================= ВЛОЖЕННЫЕ СТРАНИЦЫ ================= */}
      {page.type !== "hub" && kids.length > 0 && (
        <Section
          label="Подробнее"
          title="Отдельные направления"
          lead="Внутри этой услуги есть задачи со своей спецификой — они разобраны отдельно."
        >
          <PageRows items={kids} />
        </Section>
      )}

      {/* ================= ВОПРОСЫ ================= */}
      {page.faq && page.faq.length > 0 && (
        <Section label="Вопросы" title="Что обычно спрашивают">
          <FaqList faq={page.faq} />
        </Section>
      )}

      {/* ================= СМЕЖНОЕ ================= */}
      {related.length > 0 && (
        <section className="shell pb-[clamp(20px,3vw,32px)] pt-[clamp(12px,2vw,20px)]">
          <Reveal>
            <span className="label block text-ink-3">Смежные страницы</span>
            <ul className="mt-4 flex flex-wrap gap-2">
              {related.map((item: Page) => (
                <li key={item.url}>
                  <Link
                    href={item.url}
                    className="inline-flex items-center gap-1.5 rounded-full border border-rule px-4 py-2 text-[14.5px] text-ink-2 transition-colors hover:border-accent hover:text-ink"
                  >
                    {item.nav}
                    <ArrowUpRight size={14} className="text-ink-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      )}

      {/* ================= ЗАЯВКА ================= */}
      <section
        id="lead"
        className="shell pb-[clamp(48px,5vw,72px)] pt-[clamp(24px,3vw,40px)]"
      >
        <LeadForm title={page.cta.t} lead={page.cta.d} />
      </section>

      <JsonLd data={breadcrumbLd(trail)} />
      {page.faq && page.faq.length > 0 && <JsonLd data={faqLd(page.faq)} />}
      {page.type !== "hub" && (
        <JsonLd
          data={serviceLd({ name: page.h1, description: page.description, path: page.url })}
        />
      )}
    </>
  );
}
