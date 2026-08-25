import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { services, site } from "@/lib/content";
import { breadcrumbLd, faqLd, pageMeta } from "@/lib/seo";
import { serviceIcon } from "@/lib/icons";
import LeadForm from "@/components/LeadForm";
import { Reveal } from "@/components/motion";
import { Breadcrumbs, FaqList, JsonLd, SectionHead } from "@/components/Blocks";

export const metadata = pageMeta({
  title: `Сколько стоит разработка сайта — цены студии «${site.brand.name}»`,
  description:
    "Цены студии: час работы 2 400 ₽, лендинг от 65 000 ₽, корпоративный сайт от 180 000 ₽, интернет-магазин от 320 000 ₽, поддержка от 18 000 ₽ в месяц. Ниже рынка на 15–25 %.",
  path: "/price/",
});

const priceFaq = [
  {
    q: "Почему у вас дешевле, чем у других студий?",
    a: "Потому что у нас нет офиса в центре, продажников на проценте и наценки за имя. Ставка 2 400 ₽ в час при среднем по Москве 2 500–3 500 ₽ — это осознанная позиция: мы добираем объёмом и повторными обращениями, а не маржой с первого проекта. На качестве это не экономия: работы те же самые, просто без надбавки за вывеску.",
  },
  {
    q: "От чего зависит итоговая цена?",
    a: "От объёма работ в часах, а не от «сложности» на глаз. Мы раскладываем задачу на конкретные пункты, у каждого — оценка в часах. Вы видите смету построчно и можете убрать то, без чего можно запуститься.",
  },
  {
    q: "Цена может вырасти по ходу проекта?",
    a: "Только если вырастет объём — и только после письменного согласования. Работы, которые мы недооценили сами, доделываем за свой счёт: это наша ошибка в оценке, а не ваша.",
  },
  {
    q: "Какая предоплата?",
    a: "40 % на старте, остальное по этапам. На пакетах часов — оплата вперёд, часы не сгорают три месяца.",
  },
  {
    q: "Работаете с самозанятыми и ИП без НДС?",
    a: "Да, работаем по договору с любым статусом заказчика. Закрывающие документы предоставляем.",
  },
];

export default function PricePage() {
  const trail = [
    { name: "Главная", path: "/" },
    { name: "Цены", path: "/price/" },
  ];

  const hourly = site.pricing.table.find((row) => row.service === "Час разработки");

  return (
    <>
      <Breadcrumbs trail={trail} />

      <section className="shell pb-16 pt-[clamp(30px,6vh,70px)]">
        <div className="grid items-end gap-[clamp(26px,6vw,80px)] lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Reveal>
              <h1 className="max-w-[13ch] text-[clamp(40px,7vw,104px)] font-semibold leading-[0.92] tracking-[-0.05em] text-ink">
                Цены и расчёт стоимости
              </h1>
            </Reveal>
            <Reveal index={1}>
              <p className="mt-8 max-w-[52ch] text-[clamp(15px,1.05vw,17px)] leading-[1.7] text-ink-2 text-pretty">
                {site.pricing.policy}
              </p>
            </Reveal>
          </div>

          {/* Ставка крупно — та же строка прайса, только читаемая с порога */}
          {hourly && (
            <Reveal index={2}>
              <div>
                <div className="font-display text-[clamp(64px,10vw,150px)] font-bold leading-[0.85] tracking-[-0.06em] text-gradient">
                  {hourly.price}
                </div>
                <div className="label mt-3 text-ink-3">{hourly.service}</div>
                <div
                  className="relative mt-6 h-1.5 overflow-hidden rounded"
                  style={{ background: "rgba(255,255,255,.09)" }}
                >
                  <div
                    className="absolute inset-y-0 left-0 w-[72%] rounded"
                    style={{
                      background:
                        "linear-gradient(90deg, color-mix(in srgb, var(--accent) 50%, transparent), var(--accent-hi))",
                      boxShadow: "0 0 22px color-mix(in srgb, var(--accent) 70%, transparent)",
                    }}
                  />
                </div>
                <div className="mt-3 flex justify-between font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-3">
                  <span>Наша цена</span>
                  <span>Средняя по рынку {hourly.market}</span>
                </div>
              </div>
            </Reveal>
          )}
        </div>

        <Reveal index={3}>
          <p className="mt-12 max-w-[64ch] border-l-2 border-accent pl-5 text-[15px] leading-relaxed text-ink-2">
            Колонка «средняя по рынку» — ориентиры по открытым прайсам студий среднего сегмента
            Москвы, август 2026. Мы держимся чуть ниже нижней границы: дешевле студий, дороже
            фриланса.
          </p>
        </Reveal>
      </section>

      {/* Таблица */}
      <section className="shell py-12">
        <div className="overflow-hidden rounded-[20px] border border-rule bg-deep-2 backdrop-blur-[14px]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr>
                  <th className="label px-[clamp(14px,2.2vw,28px)] py-4 font-normal text-ink-3">
                    Услуга
                  </th>
                  <th className="label px-[clamp(14px,2.2vw,28px)] py-4 text-right font-normal text-ink-3">
                    Наша цена
                  </th>
                  <th className="label px-[clamp(14px,2.2vw,28px)] py-4 text-right font-normal text-ink-3">
                    Средняя по рынку
                  </th>
                  <th className="label px-[clamp(14px,2.2vw,28px)] py-4 font-normal text-ink-3">
                    Что входит
                  </th>
                </tr>
              </thead>
              <tbody>
                {site.pricing.table.map((row) => (
                  <tr
                    key={row.service}
                    className="border-t border-rule transition-colors hover:bg-sunk"
                  >
                    <td className="px-[clamp(14px,2.2vw,28px)] py-[clamp(13px,1.7vw,19px)] text-[15px] text-ink">
                      {row.service}
                    </td>
                    <td className="whitespace-nowrap px-[clamp(14px,2.2vw,28px)] py-[clamp(13px,1.7vw,19px)] text-right font-mono text-[13.5px] tabular-nums text-accent-soft">
                      {row.price}
                    </td>
                    <td className="whitespace-nowrap px-[clamp(14px,2.2vw,28px)] py-[clamp(13px,1.7vw,19px)] text-right font-mono text-[13.5px] tabular-nums text-ink-3 line-through">
                      {row.market}
                    </td>
                    <td className="px-[clamp(14px,2.2vw,28px)] py-[clamp(13px,1.7vw,19px)] text-[14px] text-ink-2">
                      {row.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Условия */}
      <section className="shell py-[clamp(60px,12vh,150px)]">
        <SectionHead
          label="Условия"
          title={
            <>
              Как мы считаем
              <br />
              <span className="italic text-accent-hi">и за что берём деньги</span>
            </>
          }
        />
        <ul className="mt-14 grid gap-2.5 md:grid-cols-2">
          {site.pricing.conditions.map((condition, i) => (
            <Reveal as="li" index={i % 2} key={condition}>
              <div className="card flex h-full gap-5 p-7 hover:border-accent/50">
                <span className="font-mono text-[12px] text-accent-hi">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[14.5px] leading-relaxed text-ink-2">{condition}</span>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Цены по услугам */}
      <section className="shell py-[clamp(40px,8vh,100px)]">
        <SectionHead
          label="По услугам"
          title={
            <>
              Подробные
              <br />
              <span className="italic text-accent-hi">тарифы</span>
            </>
          }
        />
        <div className="mt-14 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = serviceIcon(service.slug);
            return (
              <Link
                key={service.slug}
                href={`/uslugi/${service.slug}/`}
                className="card group flex items-center gap-4 p-6 hover:border-accent/50 hover:bg-surface-2"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-wash text-accent-hi">
                  <Icon size={18} strokeWidth={1.9} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">{service.nav}</span>
                  <span className="font-mono text-[12px] text-ink-3">
                    {service.priceFrom} · {service.term}
                  </span>
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

      <section className="shell py-[clamp(40px,8vh,100px)]">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHead
            label="Вопросы"
            title={
              <>
                Вопросы
                <br />
                <span className="italic text-accent-hi">про деньги</span>
              </>
            }
          />
          <FaqList faq={priceFaq} />
        </div>
      </section>

      <section className="shell py-[clamp(60px,12vh,150px)]">
        <div className="grid gap-[clamp(28px,6vw,88px)] lg:grid-cols-2 lg:items-start">
          <SectionHead
            label="Заявка"
            title={
              <>
                Посчитаем
                <br />
                <span className="italic text-accent-hi">вашу задачу</span>
              </>
            }
            lead="Оценка бесплатная. По типовой задаче отвечаем в течение дня, по сложной — за два-три с разбивкой по работам."
          />
          <LeadForm />
        </div>
      </section>

      <JsonLd data={faqLd(priceFaq)} />
      <JsonLd data={breadcrumbLd(trail)} />
    </>
  );
}
