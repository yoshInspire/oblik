import Link from "next/link";
import { Code2, Rocket, Users } from "lucide-react";
import { services, site } from "@/lib/content";
import { faqLd, pageMeta } from "@/lib/seo";
import LeadForm from "@/components/LeadForm";
import WhyAccordion from "@/components/WhyAccordion";
import { Counter, Reveal } from "@/components/motion";
import {
  FaqList,
  JsonLd,
  PitchCards,
  PriceCards,
  QuotePanel,
  Section,
  ServiceList,
  Steps,
} from "@/components/Blocks";

export const metadata = pageMeta({
  title: `Разработка сайтов и веб-сервисов в Москве — студия «${site.brand.name}»`,
  description:
    "Разрабатываем сайты, интернет-магазины и веб-сервисы с нуля и дорабатываем проекты, написанные другими. Ставка 2 400 ₽/час, оценка задачи за день, код передаём заказчику.",
  path: "/",
});

const stats = [
  { value: 2400, suffix: " ₽", label: "ставка за час работы" },
  { value: 11, suffix: "", label: "направлений работы" },
  { value: 1, suffix: " день", label: "на оценку типовой задачи" },
];

const pitchIcons = [Rocket, Code2, Users];

export default function HomePage() {
  const { home, pricing } = site;
  const priceHighlights = pricing.table.filter((row) =>
    ["Лендинг", "Корпоративный сайт", "Интернет-магазин", "Поддержка, месяц"].includes(row.service)
  );

  return (
    <>
      {/* ================= ПЕРВЫЙ ЭКРАН ================= */}
      <section className="relative grid min-h-[82vh] content-center pb-[clamp(40px,6vh,80px)] pl-[clamp(24px,6vw,104px)] pr-[clamp(20px,4vw,56px)] pt-[clamp(48px,7vh,104px)]">
        <div className="relative grid gap-[clamp(28px,4vw,64px)] lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,240px)]">
          <div>
            <h1
              className="max-w-[15ch] text-[clamp(38px,6.2vw,84px)] font-medium leading-[1.0] tracking-[-0.04em] text-ink"
              style={{ animation: "vUp 1.1s cubic-bezier(.16,1,.3,1) .05s both" }}
            >
              Разрабатываем сайты
              <br />и <span className="text-stroke">подхватываем</span> чужие
            </h1>

            <div className="rule-fading mt-[clamp(28px,4vh,52px)] flex flex-wrap items-end gap-[clamp(20px,3vw,48px)] pt-[clamp(20px,3vh,32px)]">
              <p
                className="min-w-[min(100%,30ch)] max-w-[46ch] flex-[1_1_34ch] text-pretty text-[17px] leading-[1.62] text-ink-2"
                style={{ animation: "vIn .9s .3s both" }}
              >
                {home.hero.sub}
              </p>
              <div
                className="flex flex-none flex-wrap items-center gap-3"
                style={{ animation: "vIn .9s .42s both" }}
              >
                <Link href="/contacts/" className="btn btn-primary">
                  {home.hero.cta}
                </Link>
                <Link href="/price/" className="btn btn-outline">
                  {home.hero.ctaSecondary}
                </Link>
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="hidden w-px lg:block"
            style={{
              background:
                "linear-gradient(to bottom, transparent, var(--rule-2) 15%, var(--rule-2) 85%, transparent)",
            }}
          />

          <div
            className="flex flex-wrap justify-between gap-[clamp(20px,3vh,34px)] lg:flex-col lg:flex-nowrap lg:justify-center"
            style={{ animation: "vFade 1.2s .5s both" }}
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <span className="block font-display text-[30px] font-medium tracking-[-0.03em] text-ink">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </span>
                <span className="mt-1 block text-[14.5px] leading-[1.45] text-ink-2">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ТРИ НАПРАВЛЕНИЯ ================= */}
      <Section
        label="Что мы делаем"
        title={
          <>
            Три способа
            <br />с нами работать
          </>
        }
        lead="Разные ситуации требуют разного формата. Выберите тот, что похож на вашу."
      >
        <PitchCards
          items={home.pitch.map((item, i) => {
            const Icon = pitchIcons[i] ?? Rocket;
            return {
              icon: <Icon size={20} strokeWidth={1.9} />,
              title: item.t,
              text: item.d,
              href: "/uslugi/",
            };
          })}
        />
      </Section>

      {/* ================= УСЛУГИ ================= */}
      <Section
        label="Услуги"
        title={
          <>
            С чем к нам
            <br />
            приходят
          </>
        }
        lead="От разовой правки на существующем сайте до продукта, собранного с нуля."
        link={{ href: "/uslugi/", text: "Все услуги" }}
      >
        <ServiceList items={services} />
      </Section>

      {/* ================= ПОЧЕМУ МЫ ================= */}
      <section className="shell py-[clamp(44px,5vw,76px)]">
        <Reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-4">
            <h2 className="text-[clamp(28px,3vw,42px)] leading-[1.05] text-ink">Чем отличаемся</h2>
            <p className="max-w-[40ch] text-pretty text-[15.5px] leading-[1.6] text-ink-2">
              Четыре причины, каждая проверяется до подписания договора.
            </p>
            <span className="label text-ink-3">Почему мы</span>
          </div>
        </Reveal>

        <div className="mt-[clamp(24px,3vw,40px)]">
          <WhyAccordion items={home.why} />
        </div>
      </section>

      {/* ================= ЦИТАТА ================= */}
      <div className="shell pb-[clamp(24px,3vw,40px)] pt-[clamp(12px,2vw,24px)]">
        <QuotePanel href="/contacts/">
          «Уйти от нас к другому подрядчику можно за один день —{" "}
          <span className="text-accent-hi">и это правильно</span>»
        </QuotePanel>
      </div>

      {/* ================= ПРОЦЕСС ================= */}
      <section className="shell py-[clamp(44px,5vw,76px)]">
        <Reveal>
          <div className="grid items-end gap-x-[clamp(28px,4vw,64px)] gap-y-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,42ch)]">
            <div>
              <span className="label block text-ink-3">Как устроена работа</span>
              <h2 className="mt-3.5 text-[clamp(28px,3vw,42px)] leading-[1.06] text-ink">
                Прозрачный процесс от первого шага
              </h2>
            </div>
            <p className="text-pretty text-[15.5px] leading-[1.6] text-ink-2">
              {home.processTeaser}
            </p>
          </div>
        </Reveal>

        <div className="mt-[clamp(32px,4vw,56px)]">
          <Steps steps={site.about.process.map(({ t, d, dur }) => ({ t, d, dur }))} />
        </div>
      </section>

      {/* ================= ЦЕНЫ ================= */}
      <Section
        label="Цены"
        title={
          <>
            Сколько
            <br />
            это стоит
          </>
        }
        lead={pricing.policy}
        link={{ href: "/price/", text: "Полный прайс и условия" }}
      >
        <PriceCards rows={priceHighlights} />
      </Section>

      {/* ================= ВОПРОСЫ И ЗАЯВКА ================= */}
      <section
        id="lead"
        className="shell grid gap-x-[clamp(28px,4vw,64px)] gap-y-10 pb-[clamp(48px,5vw,72px)] pt-[clamp(36px,4vw,60px)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
      >
        <div>
          <span className="label block text-ink-3">Вопросы</span>
          <h2 className="mt-3.5 text-[clamp(26px,2.4vw,34px)] leading-[1.15] text-ink">
            Что обычно спрашивают
          </h2>

          <div className="mt-6">
            <FaqList faq={home.faq} />
          </div>

          <ul className="mt-7 flex flex-col gap-2.5 border-t border-rule pt-5">
            {pricing.conditions.slice(0, 3).map((condition) => (
              <li key={condition} className="max-w-[62ch] text-[14.5px] leading-[1.6] text-ink-3">
                {condition}
              </li>
            ))}
          </ul>
        </div>

        <LeadForm title={home.finalCta.t} lead={home.finalCta.d} />
      </section>

      <JsonLd data={faqLd(home.faq)} />
    </>
  );
}
