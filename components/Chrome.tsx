"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { childrenOf, site } from "@/lib/content";

/* Знак: словесный логотип и пульсирующая точка */
function Mark({ size = 20 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-baseline gap-[9px] font-display font-semibold"
      style={{ fontSize: size, letterSpacing: "-0.02em", color: "var(--ink)" }}
    >
      {site.brand.name}
      <span
        aria-hidden="true"
        className="h-[5px] w-[5px] rounded-full"
        style={{
          background: "var(--accent)",
          boxShadow: "0 0 14px var(--accent)",
          animation: "vPulse 2.4s ease-in-out infinite",
        }}
      />
    </span>
  );
}

const links = [
  { href: "/uslugi/", label: "Услуги" },
  { href: "/tehnologii/", label: "Технологии" },
  { href: "/stoimost/", label: "Стоимость" },
  { href: "/about/", label: "О студии" },
  { href: "/contacts/", label: "Контакты" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b border-rule"
        style={{
          backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
          background: "linear-gradient(180deg, rgba(11,13,24,.86), rgba(11,13,24,.34))",
        }}
      >
        <div className="shell grid h-[68px] grid-cols-[auto_1fr_auto] items-center gap-6">
          <Link href="/" aria-label="На главную">
            <Mark />
          </Link>

          <nav
            className="hidden items-center justify-center gap-[clamp(18px,2.4vw,34px)] lg:flex"
            aria-label="Основная навигация"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[15px] text-ink-2 transition-colors duration-200 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-3">
            <Link href="/contacts/" className="btn btn-outline btn-sm">
              Обсудить задачу
            </Link>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Открыть меню"
              className="grid h-9 w-9 place-items-center rounded-lg border border-rule-2 text-ink lg:hidden"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] text-ink lg:hidden"
            style={{ background: "rgba(11,13,24,.94)", backdropFilter: "blur(20px)" }}
          >
            <div className="shell flex h-[68px] items-center">
              <Mark />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Закрыть меню"
                className="ml-auto grid h-9 w-9 place-items-center rounded-lg border border-rule-2"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="shell mt-8 flex flex-col" aria-label="Мобильная навигация">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-rule py-5 font-display text-[28px] font-medium tracking-[-0.028em]"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="shell mt-10">
              <Link
                href="/contacts/"
                onClick={() => setOpen(false)}
                className="btn btn-primary w-full"
              >
                Обсудить задачу
              </Link>
              <p className="label mt-6 text-ink-3">{site.brand.contacts.email}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const sections = [
  { href: "/uslugi/", label: "Все услуги" },
  { href: "/tehnologii/", label: "Технологии" },
  { href: "/otraslyam/", label: "Отраслям" },
  { href: "/goroda/", label: "География" },
  { href: "/voprosy/", label: "Вопросы" },
  { href: "/stoimost/", label: "Стоимость" },
];

export function Footer() {
  const services = childrenOf("/uslugi/");
  const half = Math.ceil(services.length / 2);
  const { contacts } = site.brand;

  const channels = [
    { text: contacts.email, href: `mailto:${contacts.email}` },
    { text: contacts.phone, href: `tel:${contacts.phone.replace(/[^+\d]/g, "")}` },
    {
      text: `Telegram ${contacts.telegram}`,
      href: `https://t.me/${contacts.telegram.replace("@", "")}`,
    },
    { text: site.brand.city, href: null },
  ];

  return (
    <footer className="relative text-[14.5px] text-ink-2">
      <div className="shell">
        <div className="ruler-rule" aria-hidden="true" />
      </div>

      <div className="shell relative py-[clamp(32px,3.5vw,48px)]">
        <div className="grid gap-x-[clamp(24px,4vw,52px)] gap-y-8 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1.05fr]">
          <div>
            <Mark />
            <p className="mt-4 max-w-[34ch] text-[14.5px] leading-[1.6] text-ink-2">
              {site.brand.positioning}
            </p>
            <p className="mt-[18px] text-[13.5px] leading-[1.6] text-ink-3">
              Студия «{site.brand.name}» · ИНН {site.brand.requisites.inn} · ОГРНИП{" "}
              {site.brand.requisites.ogrn}
            </p>
          </div>

          <div>
            <h4 className="label text-ink-3">Услуги</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-[14.5px]">
              {services.slice(0, half).map((service) => (
                <li key={service.url}>
                  <Link href={service.url} className="text-ink-2 transition-colors hover:text-ink">
                    {service.nav}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="label text-ink-3">Ещё</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-[14.5px]">
              {services.slice(half).map((service) => (
                <li key={service.url}>
                  <Link href={service.url} className="text-ink-2 transition-colors hover:text-ink">
                    {service.nav}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="label text-ink-3">Разделы</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-[14.5px]">
              {sections.map((section) => (
                <li key={section.href}>
                  <Link href={section.href} className="text-ink-2 transition-colors hover:text-ink">
                    {section.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/privacy/" className="text-ink-2 transition-colors hover:text-ink">
                  Политика конфиденциальности
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="label text-ink-3">Связь</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-[14.5px]">
              {channels.map((channel) => (
                <li key={channel.text}>
                  {channel.href ? (
                    <a
                      href={channel.href}
                      className="text-ink-2 transition-colors hover:text-ink"
                    >
                      {channel.text}
                    </a>
                  ) : (
                    <span className="text-ink-2">{channel.text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-2 border-t border-rule pt-5 text-[13.5px] text-ink-3 md:flex-row md:justify-between">
          <span>© 2026 Студия «{site.brand.name}»</span>
          <span>Разбор задачи и оценка — бесплатно · код и доступы у заказчика</span>
        </div>
      </div>
    </footer>
  );
}
