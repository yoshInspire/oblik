"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { childrenOf, site } from "@/lib/content";
import { TelegramIcon } from "./TelegramIcon";

/* Знак. Собран из кадра покоя исходного ролика: прозрачность взята из
   «темноты» кадра (белый фон уходит в ноль, буквы остаются), тени подняты,
   чтобы надпись читалась на тёмном.
   Анимацию оттуда вытащить не вышло: на кадрах с бликом дым лежит в том же
   тоне, что и фон, и после ключевания проступает грязью поверх букв.
   Для движущегося знака нужен исходник на прозрачном или тёмном фоне. */
function Mark({ className = "h-6 sm:h-7" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/oblik-logo.webp"
      alt="Облик"
      width={480}
      height={168}
      draggable={false}
      className={`block w-auto max-w-none ${className}`}
    />
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

  // Пока открыто меню, страница под ним стоит. Замок вешаем и на html:
  // документ прокручивает именно он, одного body мало.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prevRoot = root.style.overflow;
    const prevBody = document.body.style.overflow;
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      root.style.overflow = prevRoot;
      document.body.style.overflow = prevBody;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="site-header sticky top-0 z-50 border-b border-rule">
        <div className="shell grid h-16 grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-6 lg:h-[68px]">
          <Link href="/" aria-label="На главную" className="-my-2 shrink-0 py-2">
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
            {/* Ниже sm кнопка не помещается рядом со знаком — она
                же есть первым делом в мобильном меню */}
            <Link href="/contacts/" className="btn btn-outline btn-sm hidden sm:inline-flex">
              Обсудить задачу
            </Link>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Открыть меню"
              aria-expanded={open}
              className="-mr-2 grid h-11 w-11 place-items-center rounded-lg text-ink sm:mr-0 sm:border sm:border-rule-2 lg:hidden"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Меню"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            /* Меню выше окна на маленьких экранах — оно должно прокручиваться
               само и не тянуть за собой страницу под ним */
            className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain pb-[max(32px,env(safe-area-inset-bottom))] text-ink lg:hidden"
            style={{ background: "rgba(11,13,24,.97)" }}
          >
            <div className="shell flex h-16 items-center lg:h-[68px]">
              <Mark />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Закрыть меню"
                className="-mr-2 ml-auto grid h-11 w-11 place-items-center rounded-lg sm:mr-0 sm:border sm:border-rule-2"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="shell mt-6 flex flex-col" aria-label="Мобильная навигация">
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
                    className="block border-b border-rule py-[18px] font-display text-[clamp(23px,7vw,28px)] font-medium tracking-[-0.028em]"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="shell mt-8">
              <Link
                href="/contacts/"
                onClick={() => setOpen(false)}
                className="btn btn-primary w-full"
              >
                Обсудить задачу
              </Link>

              {/* С телефона проще позвонить или написать сразу из меню */}
              <ul className="mt-6 flex flex-col gap-1">
                {site.brand.contacts.phones.slice(0, 1).map((phone) => (
                  <li key={phone}>
                    <a
                      href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                      className="inline-block py-2 text-[15px] text-ink-2"
                    >
                      {phone}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href={`mailto:${site.brand.contacts.email}`}
                    className="inline-block py-2 text-[15px] text-ink-2"
                  >
                    {site.brand.contacts.email}
                  </a>
                </li>
              </ul>
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
    ...contacts.phones.map((phone) => ({
      text: phone,
      href: `tel:${phone.replace(/[^+\d]/g, "")}`,
    })),
    { text: site.brand.city, href: null },
  ];

  return (
    <footer className="relative text-[14.5px] text-ink-2">
      <div className="shell">
        <div className="ruler-rule" aria-hidden="true" />
      </div>

      <div className="shell relative py-[clamp(32px,3.5vw,48px)]">
        {/* На телефоне списки идут в две колонки: одной колонкой подвал
            вырастает в бесконечную простыню */}
        <div className="grid grid-cols-2 gap-x-[clamp(18px,4vw,52px)] gap-y-8 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1.05fr]">
          <div className="col-span-2 md:col-span-1">
            <Mark />
            <p className="mt-4 max-w-[34ch] text-[14.5px] leading-[1.6] text-ink-2">
              {site.brand.positioning}
            </p>
            <p className="mt-[18px] text-[13.5px] leading-[1.6] text-ink-3">
              Студия «{site.brand.name}» · {site.brand.requisites.address}
            </p>
          </div>

          <div>
            <h4 className="label text-ink-3">Услуги</h4>
            <ul className="mt-4 flex flex-col gap-0.5 text-[14.5px] md:gap-2.5">
              {services.slice(0, half).map((service) => (
                <li key={service.url}>
                  <Link href={service.url} className="inline-block py-2 text-ink-2 transition-colors hover:text-ink md:py-0">
                    {service.nav}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="label text-ink-3">Ещё</h4>
            <ul className="mt-4 flex flex-col gap-0.5 text-[14.5px] md:gap-2.5">
              {services.slice(half).map((service) => (
                <li key={service.url}>
                  <Link href={service.url} className="inline-block py-2 text-ink-2 transition-colors hover:text-ink md:py-0">
                    {service.nav}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="label text-ink-3">Разделы</h4>
            <ul className="mt-4 flex flex-col gap-0.5 text-[14.5px] md:gap-2.5">
              {sections.map((section) => (
                <li key={section.href}>
                  <Link href={section.href} className="inline-block py-2 text-ink-2 transition-colors hover:text-ink md:py-0">
                    {section.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/privacy/" className="inline-block py-2 text-ink-2 transition-colors hover:text-ink md:py-0">
                  Политика конфиденциальности
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="label text-ink-3">Связь</h4>
            <ul className="mt-4 flex flex-col gap-0.5 text-[14.5px] md:gap-2.5">
              {channels.map((channel) => (
                <li key={channel.text}>
                  {channel.href ? (
                    <a
                      href={channel.href}
                      className="inline-block py-2 text-ink-2 transition-colors hover:text-ink md:py-0"
                    >
                      {channel.text}
                    </a>
                  ) : (
                    <span className="text-ink-2">{channel.text}</span>
                  )}
                </li>
              ))}
            </ul>

            <ul className="mt-4 flex items-center gap-2.5">
              {contacts.telegram.map((nick) => (
                <li key={nick}>
                  <a
                    href={`https://t.me/${nick.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Telegram ${nick}`}
                    title={`Telegram ${nick}`}
                    className="grid h-11 w-11 place-items-center rounded-lg border border-rule-2 text-ink-3 transition-colors hover:border-accent hover:text-accent-hi md:h-9 md:w-9"
                  >
                    <TelegramIcon size={17} />
                  </a>
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
