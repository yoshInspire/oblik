import { services, site } from "@/lib/content";
import { breadcrumbLd, pageMeta } from "@/lib/seo";
import { Reveal } from "@/components/motion";
import { Breadcrumbs, JsonLd, SectionHead, ServiceRows } from "@/components/Blocks";

export const metadata = pageMeta({
  title: `Услуги веб-студии «${site.brand.name}» — разработка, доработка, поддержка`,
  description:
    "Разработка сайтов, интернет-магазинов и веб-сервисов, доработка чужих проектов, поддержка, аудит, интеграции с 1С и CRM, выделенная команда. Цены и сроки по каждой услуге.",
  path: "/uslugi/",
});

export default function ServicesPage() {
  const trail = [
    { name: "Главная", path: "/" },
    { name: "Услуги", path: "/uslugi/" },
  ];

  const support = services.filter((s) =>
    ["dorabotka-sajta", "podderzhka-sajta", "audit-i-uskorenie", "integracii", "vydelennaya-komanda", "redesign"].includes(s.slug)
  );
  const build = services.filter((s) => !support.includes(s));

  return (
    <>
      <Breadcrumbs trail={trail} />

      <section className="shell pb-16 pt-[clamp(30px,6vh,70px)]">
        <Reveal>
          <h1 className="max-w-[16ch] text-[clamp(44px,8vw,120px)] font-semibold leading-[0.92] tracking-[-0.05em] text-ink">
            Услуги студии
          </h1>
        </Reveal>
        <Reveal index={1}>
          <p className="mt-8 max-w-[58ch] text-[clamp(15px,1.05vw,17px)] leading-[1.7] text-ink-2 text-pretty">
            Одиннадцать направлений работы. Первая половина — про существующие проекты: доработка,
            поддержка, аудит, интеграции. Вторая — про разработку с нуля. У каждой услуги своя
            страница с составом работ, тарифами и сроками.
          </p>
        </Reveal>
      </section>

      <section className="shell py-[clamp(40px,8vh,100px)]">
        <SectionHead
          label="Существующие проекты"
          title={
            <>
              Когда продукт
              <br />
              <span className="italic text-accent-hi">уже есть</span>
            </>
          }
          lead="Самый частый повод обратиться: подрядчик пропал, код не поддерживается, задачи копятся."
        />
        <div className="mt-[clamp(26px,5vh,60px)]">
          <ServiceRows items={support} />
        </div>
      </section>

      <div className="shell">
        <div className="ruler-rule" aria-hidden="true" />
      </div>

      <section className="shell py-[clamp(40px,8vh,100px)] pb-[clamp(60px,12vh,150px)]">
        <SectionHead
          label="Разработка с нуля"
          title={
            <>
              Когда продукта
              <br />
              <span className="italic text-accent-hi">ещё нет</span>
            </>
          }
          lead="От лендинга под рекламу до нагруженного сервиса с ролями и личными кабинетами."
        />
        <div className="mt-[clamp(26px,5vh,60px)]">
          <ServiceRows items={build} />
        </div>
      </section>

      <JsonLd data={breadcrumbLd(trail)} />
    </>
  );
}
