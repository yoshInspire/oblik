import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Clock, Wallet } from "lucide-react";
import { getService, relatedServices, services, site } from "@/lib/content";
import { breadcrumbLd, faqLd, pageMeta, serviceLd } from "@/lib/seo";
import { serviceIcon } from "@/lib/icons";
import LeadForm from "@/components/LeadForm";
import { Magnetic, Reveal } from "@/components/motion";
import {
  Breadcrumbs,
  FaqList,
  JsonLd,
  Packages,
  SectionHead,
  ServiceCard,
  Steps,
  TickList,
} from "@/components/Blocks";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  return pageMeta({
    title: service.title,
    description: service.description,
    path: `/uslugi/${service.slug}/`,
  });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const Icon = serviceIcon(service.slug);
  const related = relatedServices(service.related);
  const trail = [
    { name: "Главная", path: "/" },
    { name: "Услуги", path: "/uslugi/" },
    { name: service.nav, path: `/uslugi/${service.slug}/` },
  ];

  return (
    <>
      <Breadcrumbs trail={trail} />

      {/* ===== Первый экран ===== */}
      <section className="shell pb-16 pt-[clamp(24px,5vh,56px)] md:pb-20">
        <Reveal>
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent-wash text-accent-hi">
            <Icon size={26} strokeWidth={1.8} />
          </span>
        </Reveal>

        <Reveal index={1}>
          <h1 className="mt-8 max-w-[18ch] text-[clamp(38px,6.4vw,96px)] font-semibold leading-[0.94] tracking-[-0.05em] text-ink">
            {service.h1}
          </h1>
        </Reveal>

        <Reveal index={2}>
          <p className="mt-8 max-w-[58ch] text-[clamp(15px,1.05vw,17px)] leading-[1.7] text-ink-2 text-pretty">
            {service.lead}
          </p>
        </Reveal>

        <Reveal index={3}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Magnetic>
              <Link href="#zayavka" className="btn btn-primary">
                Обсудить задачу
                <ArrowUpRight size={17} strokeWidth={2.2} />
              </Link>
            </Magnetic>
            <Link href="/price/" className="btn btn-outline">
              Все цены
            </Link>
          </div>
        </Reveal>

        <Reveal index={4}>
          <div className="mt-14 grid gap-2.5 sm:grid-cols-3">
            <div className="card flex items-center gap-4 p-6">
              <Wallet size={20} className="shrink-0 text-accent-hi" strokeWidth={1.8} />
              <span>
                <span className="label block text-ink-3">Цена</span>
                <span className="mt-1 block font-display text-[19px] font-semibold text-ink">
                  {service.priceFrom}
                </span>
              </span>
            </div>
            <div className="card flex items-center gap-4 p-6">
              <Clock size={20} className="shrink-0 text-accent-hi" strokeWidth={1.8} />
              <span>
                <span className="label block text-ink-3">Срок</span>
                <span className="mt-1 block font-display text-[19px] font-semibold text-ink">
                  {service.term}
                </span>
              </span>
            </div>
            <div className="card flex items-center gap-4 p-6">
              <ArrowUpRight size={20} className="shrink-0 text-accent-hi" strokeWidth={1.8} />
              <span>
                <span className="label block text-ink-3">Оценка</span>
                <span className="mt-1 block font-display text-[19px] font-semibold text-ink">
                  1–3 дня
                </span>
              </span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== Что входит ===== */}
      <section className="shell py-[clamp(50px,10vh,120px)]">
        <SectionHead
          label="Состав работ"
          title={
            <>
              Что входит
              <br />
              <span className="italic text-accent-hi">в услугу</span>
            </>
          }
        />
        <div className="mt-14">
          <TickList items={service.includes} />
        </div>
      </section>

      {/* ===== Цены ===== */}
      <section className="shell py-[clamp(50px,10vh,120px)]">
        <SectionHead
          label="Цены"
          title={
            <>
              Сколько
              <br />
              <span className="italic text-accent-hi">это стоит</span>
            </>
          }
          lead="Ниже среднего по рынку на 15–25 %. Итоговая сумма фиксируется в договоре после разбора задачи — вилка «от» здесь не для того, чтобы потом её переписать."
        />
        <div className="mt-14">
          <Packages packs={service.packages} />
        </div>

        <ul className="mt-14 grid gap-4 md:grid-cols-2">
          {site.pricing.conditions.map((condition) => (
            <li key={condition} className="flex gap-4 text-[14.5px] leading-relaxed text-ink-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {condition}
            </li>
          ))}
        </ul>
      </section>

      {/* ===== Процесс ===== */}
      <section className="shell py-[clamp(50px,10vh,120px)]">
        <SectionHead
          label="Процесс"
          title={
            <>
              Как идёт
              <br />
              <span className="italic text-accent-hi">работа</span>
            </>
          }
        />
        <div className="mt-14">
          <Steps steps={service.process} />
        </div>
      </section>

      {/* ===== Вопросы ===== */}
      <section className="shell py-[clamp(50px,10vh,120px)]">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHead
            label="Вопросы"
            title={
              <>
                Частые
                <br />
                <span className="italic text-accent-hi">вопросы</span>
              </>
            }
          />
          <FaqList faq={service.faq} />
        </div>
      </section>

      {/* ===== Заявка ===== */}
      <section id="zayavka" className="shell py-[clamp(50px,10vh,120px)]">
        <div className="grid gap-[clamp(28px,6vw,88px)] lg:grid-cols-2 lg:items-start">
          <SectionHead
            label="Заявка"
            title={
              <>
                Расскажите
                <br />
                <span className="italic text-accent-hi">про задачу</span>
              </>
            }
            lead="Опишите в двух словах, что нужно сделать. Вернёмся с уточняющими вопросами и вилкой стоимости. Если поймём, что задача не наша, скажем прямо и подскажем, к кому идти."
          />
          <LeadForm />
        </div>
      </section>

      {/* ===== Смежное ===== */}
      {related.length > 0 && (
        <section className="shell pb-[clamp(60px,12vh,150px)]">
          <SectionHead
            label="Смежное"
            title={
              <>
                С этим
                <br />
                <span className="italic text-accent-hi">обычно берут</span>
              </>
            }
          />
          <div className="mt-14 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item, i) => (
              <ServiceCard key={item.slug} service={item} index={i} />
            ))}
          </div>
        </section>
      )}

      <JsonLd
        data={serviceLd({
          name: service.h1,
          description: service.description,
          path: `/uslugi/${service.slug}/`,
          priceFrom: service.priceFrom,
        })}
      />
      <JsonLd data={faqLd(service.faq)} />
      <JsonLd data={breadcrumbLd(trail)} />
    </>
  );
}
