import { Mail, MapPin, Phone, Send } from "lucide-react";
import { site } from "@/lib/content";
import { breadcrumbLd, pageMeta } from "@/lib/seo";
import LeadForm from "@/components/LeadForm";
import { Reveal } from "@/components/motion";
import { Breadcrumbs, JsonLd } from "@/components/Blocks";

export const metadata = pageMeta({
  title: `Контакты студии «${site.brand.name}» — Москва`,
  description:
    "Контакты веб-студии: почта, телефон, Telegram. Опишите задачу — вернёмся с уточняющими вопросами и вилкой стоимости в течение рабочего дня.",
  path: "/contacts/",
});

export default function ContactsPage() {
  const trail = [
    { name: "Главная", path: "/" },
    { name: "Контакты", path: "/contacts/" },
  ];
  const { contacts } = site.brand;

  const channels = [
    {
      icon: Mail,
      label: "Почта",
      value: contacts.email,
      href: `mailto:${contacts.email}`,
      note: "Присылайте задачу и ссылку на сайт, если он есть",
    },
    {
      icon: Send,
      label: "Telegram",
      value: contacts.telegram,
      href: `https://t.me/${contacts.telegram.replace("@", "")}`,
      note: "Самый быстрый канал по срочным задачам",
    },
    {
      icon: Phone,
      label: "Телефон",
      value: contacts.phone,
      href: `tel:${contacts.phone.replace(/[^+\d]/g, "")}`,
      note: "В рабочие часы по будням",
    },
    {
      icon: MapPin,
      label: "Город",
      value: site.brand.city,
      href: null,
      note: "Работаем удалённо по всей России",
    },
  ];

  return (
    <>
      <Breadcrumbs trail={trail} />

      <section className="shell pb-16 pt-[clamp(30px,6vh,70px)]">
        <Reveal>
          <h1 className="max-w-[14ch] text-[clamp(40px,7vw,104px)] font-semibold leading-[0.92] tracking-[-0.05em] text-ink">
            {site.contacts.h1}
          </h1>
        </Reveal>
        <Reveal index={1}>
          <p className="mt-8 max-w-[54ch] text-[clamp(15px,1.05vw,17px)] leading-[1.7] text-ink-2 text-pretty">
            {site.contacts.lead}
          </p>
        </Reveal>
      </section>

      <section className="shell pb-[clamp(60px,12vh,150px)]">
        <div className="grid gap-[clamp(28px,6vw,88px)] lg:grid-cols-2 lg:items-start">
          <div className="flex flex-col gap-10">
            <div className="grid gap-2.5 sm:grid-cols-2">
              {channels.map((channel, i) => {
                const Icon = channel.icon;
                const inner = (
                  <>
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-wash text-accent-hi">
                      <Icon size={18} strokeWidth={1.9} />
                    </span>
                    <span className="label mt-5 block text-ink-3">{channel.label}</span>
                    <span className="mt-2 block font-display text-[19px] font-semibold text-ink">
                      {channel.value}
                    </span>
                    <span className="mt-2 block text-[13px] leading-snug text-ink-2">
                      {channel.note}
                    </span>
                  </>
                );

                return (
                  <Reveal key={channel.label} index={i % 2} className="h-full">
                    {channel.href ? (
                      <a
                        href={channel.href}
                        className="card block h-full p-7 hover:border-accent/50 hover:bg-surface-2"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="card h-full p-7">{inner}</div>
                    )}
                  </Reveal>
                );
              })}
            </div>

            <div>
              <h2 className="font-display text-[22px] font-semibold text-ink">
                Что писать в первом сообщении
              </h2>
              <ul className="mt-6 flex flex-col gap-3.5">
                {[
                  "Что нужно сделать — хотя бы одним предложением.",
                  "Ссылку на сайт или сервис, если задача про существующий проект.",
                  "Срок, если он жёсткий.",
                  "Ориентир по бюджету, если он есть. Если нет — не страшно, посчитаем.",
                ].map((item) => (
                  <li key={item} className="flex gap-4 text-[14.5px] text-ink-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="border-l-2 border-accent pl-5 text-[15px] leading-relaxed text-ink-2">
              На срочные аварии — упал приём заказов, лежит сайт, горит релиз — отвечаем вне
              очереди. Напишите в Telegram с пометкой «срочно».
            </p>
          </div>

          <LeadForm />
        </div>
      </section>

      <JsonLd data={breadcrumbLd(trail)} />
    </>
  );
}
