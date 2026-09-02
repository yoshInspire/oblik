import Link from "next/link";
import { childrenOf, site } from "@/lib/content";
import { breadcrumbLd, pageMeta } from "@/lib/seo";
import LeadForm from "@/components/LeadForm";
import { Reveal } from "@/components/motion";
import { Breadcrumbs, JsonLd, PageRows, Section, Steps, TickList } from "@/components/Blocks";

export const metadata = pageMeta({
  title: site.about.title,
  description: site.about.description,
  path: "/about/",
});

const trail = [
  { name: "Главная", path: "/" },
  { name: "О студии", path: "/about/" },
];

export default function AboutPage() {
  const { about } = site;

  return (
    <>
      <Breadcrumbs trail={trail} />

      <section className="shell grid gap-x-[clamp(28px,4vw,64px)] gap-y-6 pb-[clamp(20px,3vw,36px)] pt-[clamp(24px,4vh,52px)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <h1
          className="max-w-[16ch] text-[clamp(32px,4.6vw,60px)] font-medium leading-[1.04] tracking-[-0.035em] text-ink"
          style={{ animation: "vUp .9s cubic-bezier(.16,1,.3,1) .05s both" }}
        >
          {about.h1}
        </h1>
        <div className="flex flex-col gap-4 self-end" style={{ animation: "vIn .8s .25s both" }}>
          {about.lead.map((para) => (
            <p key={para.slice(0, 40)} className="text-pretty text-[16px] leading-[1.65] text-ink-2">
              {para}
            </p>
          ))}
        </div>
      </section>

      <Section label="Принципы" title="Как мы ведём работу">
        <TickList items={about.principles} />
      </Section>

      <Section
        label="Процесс"
        title="От заявки до передачи"
        lead="Порядок один и тот же для проекта с нуля и для чужого кода."
      >
        <Steps steps={about.process.map(({ t, d }) => ({ t, d }))} />
      </Section>

      <Section
        label="Границы"
        title="Чего мы не делаем"
        lead="Список короткий, но именно он чаще всего снимает вопросы на первом созвоне."
      >
        <ul className="flex flex-col">
          {about.notDoing.map((item, i) => (
            <Reveal as="li" index={Math.min(i, 3)} key={item} className="border-t border-rule py-3.5">
              <span className="text-[15.5px] leading-[1.6] text-ink-2">{item}</span>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section
        label="Направления"
        title="Чем занимаемся"
        link={{ href: "/uslugi/", text: "Все услуги" }}
      >
        <PageRows items={childrenOf("/uslugi/").slice(0, 8)} />
      </Section>

      <section id="lead" className="shell pb-[clamp(48px,5vw,72px)] pt-[clamp(24px,3vw,40px)]">
        <LeadForm
          title="Проще всего познакомиться на маленькой задаче"
          lead="Дайте конкретную правку или вопрос по существующему проекту. По одной задаче видно больше, чем по любой презентации."
        />
        <p className="mt-6 text-[14px] leading-[1.6] text-ink-3">
          Как устроена оценка и почему на сайте нет прайса —{" "}
          <Link href="/stoimost/" className="link-quiet">
            на отдельной странице
          </Link>
          .
        </p>
      </section>

      <JsonLd data={breadcrumbLd(trail)} />
    </>
  );
}
