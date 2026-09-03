import { Mail, Phone } from "lucide-react";
import { site } from "@/lib/content";
import { breadcrumbLd, organizationLd, pageMeta } from "@/lib/seo";
import LeadForm from "@/components/LeadForm";
import { Reveal } from "@/components/motion";
import { Breadcrumbs, JsonLd } from "@/components/Blocks";
import { TelegramIcon } from "@/components/TelegramIcon";

export const metadata = pageMeta({
  title: site.contacts.title,
  description: site.contacts.description,
  path: "/contacts/",
});

const trail = [
  { name: "Главная", path: "/" },
  { name: "Контакты", path: "/contacts/" },
];

export default function ContactsPage() {
  const { contacts } = site;
  const { contacts: channels, requisites } = site.brand;

  const direct = [
    {
      icon: Mail,
      label: "Почта",
      value: channels.email,
      href: `mailto:${channels.email}`,
    },
    ...channels.phones.map((phone, i) => ({
      icon: Phone,
      label: i === 0 ? "Телефон" : "",
      value: phone,
      href: `tel:${phone.replace(/[^+\d]/g, "")}`,
    })),
    ...channels.telegram.map((nick, i) => ({
      icon: TelegramIcon,
      label: i === 0 ? "Telegram" : "",
      value: nick,
      href: `https://t.me/${nick.replace("@", "")}`,
    })),
  ];

  return (
    <>
      <Breadcrumbs trail={trail} />

      <section className="shell grid gap-x-[clamp(28px,4vw,64px)] gap-y-6 pb-[clamp(20px,3vw,32px)] pt-[clamp(24px,4vh,52px)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <h1
          className="max-w-[14ch] text-[clamp(32px,4.6vw,60px)] font-medium leading-[1.04] tracking-[-0.035em] text-ink"
          style={{ animation: "vUp .9s cubic-bezier(.16,1,.3,1) .05s both" }}
        >
          {contacts.h1}
        </h1>
        <div className="flex flex-col gap-4 self-end" style={{ animation: "vIn .8s .25s both" }}>
          {contacts.lead.map((para) => (
            <p key={para.slice(0, 40)} className="text-pretty text-[16px] leading-[1.65] text-ink-2">
              {para}
            </p>
          ))}
        </div>
      </section>

      <section
        id="lead"
        className="shell grid gap-x-[clamp(28px,4vw,64px)] gap-y-10 pb-[clamp(48px,5vw,72px)] pt-[clamp(16px,2vw,28px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]"
      >
        <div>
          <Reveal>
            <span className="label block text-ink-3">Что будет дальше</span>
            <ul className="mt-5 flex flex-col">
              {contacts.expect.map((item, i) => (
                <li key={item} className="flex gap-4 border-t border-rule py-3.5">
                  <span className="font-mono text-[12.5px] text-accent-hi">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[15px] leading-[1.6] text-ink-2">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <span className="label mt-10 block text-ink-3">Напрямую</span>
            <ul className="mt-5 flex flex-col gap-2.5">
              {direct.map(({ icon: Icon, label, value, href }) => (
                <li key={value}>
                  <a href={href} className="row-link grid-cols-[20px_minmax(90px,auto)_1fr] gap-4">
                    <Icon size={18} strokeWidth={1.9} className="shrink-0 text-ink-3" />
                    <span className="label text-ink-3">{label}</span>
                    <span className="text-[15px] text-ink">{value}</span>
                  </a>
                </li>
              ))}
            </ul>

            <p className="mt-8 border-t border-rule pt-5 text-[13.5px] leading-[1.6] text-ink-3">
              Студия «{site.brand.name}» · {requisites.address}
            </p>
          </Reveal>
        </div>

        <LeadForm />
      </section>

      <JsonLd data={breadcrumbLd(trail)} />
      <JsonLd data={organizationLd()} />
    </>
  );
}
