import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/content";
import { breadcrumbLd, pageMeta } from "@/lib/seo";
import { Magnetic, Parallax, Reveal } from "@/components/motion";
import { Breadcrumbs, JsonLd, SectionHead, Steps } from "@/components/Blocks";

export const metadata = pageMeta({
  title: `О студии «${site.brand.name}»: команда, процесс, принципы`,
  description:
    "Студия разработки полного цикла из Москвы: делаем сайты и веб-сервисы с нуля и дорабатываем чужие проекты. Как мы ведём работу, что фиксируем в договоре и от каких задач отказываемся.",
  path: "/about/",
});

export default function AboutPage() {
  const trail = [
    { name: "Главная", path: "/" },
    { name: "О студии", path: "/about/" },
  ];

  return (
    <>
      <Breadcrumbs trail={trail} />

      <section className="shell pb-16 pt-[clamp(30px,6vh,70px)]">
        <Reveal>
          <h1 className="max-w-[16ch] text-[clamp(40px,7vw,104px)] font-semibold leading-[0.92] tracking-[-0.05em] text-ink">
            {site.about.h1}
          </h1>
        </Reveal>
        <Reveal index={1}>
          <p className="mt-8 max-w-[58ch] text-[clamp(15px,1.05vw,17px)] leading-[1.7] text-ink-2 text-pretty">
            {site.about.lead}
          </p>
        </Reveal>
      </section>

      {/* Принципы */}
      <section className="shell py-[clamp(60px,12vh,150px)]">
        <SectionHead
          label="Принципы"
          title={
            <>
              Как мы
              <br />
              <span className="italic text-accent-hi">работаем</span>
            </>
          }
        />

        <div className="mt-14 grid gap-x-16 gap-y-12 md:grid-cols-2">
          {site.about.principles.map((item, i) => (
            <Reveal key={item.t} index={i % 2}>
              <div className="border-t border-rule pt-7">
                <span className="font-mono text-[12px] text-accent-hi">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-[22px] font-semibold text-ink">{item.t}</h3>
                <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-ink-2">
                  {item.d}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Parallax distance={24} className="mt-20">
          <blockquote className="mx-auto max-w-[42ch] text-center font-display text-[clamp(22px,3vw,36px)] font-semibold leading-snug tracking-[-0.035em] text-ink">
            «Если срок нереальный или задача вне нашей области —{" "}
            <span className="italic text-accent-hi">скажем сразу</span>»
          </blockquote>
        </Parallax>
      </section>

      {/* Процесс */}
      <section className="shell py-[clamp(60px,12vh,150px)]">
        <SectionHead
          label="Процесс"
          title={
            <>
              Что происходит
              <br />
              <span className="italic text-accent-hi">после первого письма</span>
            </>
          }
          lead="Шесть шагов от разбора задачи до поддержки. У каждого — срок и понятный результат на выходе, чтобы в любой момент было видно, где мы находимся."
        />
        <div className="mt-14">
          <Steps steps={site.about.process.map(({ t, d, dur }) => ({ t, d, dur }))} />
        </div>
      </section>

      {/* С чего начать */}
      <section className="shell pb-[clamp(60px,12vh,150px)]">
        <div className="panel p-[clamp(26px,4vw,64px)]">
          <div className="max-w-[54ch]">
            <SectionHead
              label="Дальше"
              title={
                <>
                  С чего
                  <br />
                  <span className="italic text-accent-hi">начать</span>
                </>
              }
              lead="Самый простой способ познакомиться — дать маленькую конкретную задачу. Пакет из десяти часов стоит 22 000 ₽: этого хватает, чтобы починить что-то ощутимое и понять, как мы работаем, до того как обсуждать большой проект."
            />
            <div className="mt-10 flex flex-wrap gap-4">
              <Magnetic>
                <Link href="/contacts/" className="btn btn-primary">
                  Написать нам
                  <ArrowUpRight size={17} strokeWidth={2.2} />
                </Link>
              </Magnetic>
              <Link href="/uslugi/" className="btn btn-outline">
                Посмотреть услуги
              </Link>
            </div>
          </div>
        </div>
      </section>

      <JsonLd data={breadcrumbLd(trail)} />
    </>
  );
}
