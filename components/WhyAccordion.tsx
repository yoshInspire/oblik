"use client";

import { useState } from "react";

/**
 * «Чем отличаемся» — раскрытая по одному строка. Активная получает
 * акцентную полосу слева и показывает описание; остальные приглушены.
 */
export default function WhyAccordion({ items }: { items: { t: string; d: string }[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div>
      {items.map((item, i) => {
        const active = i === open;
        return (
          <button
            key={item.t}
            type="button"
            aria-expanded={active}
            onClick={() => setOpen(i)}
            className="grid w-full cursor-pointer grid-cols-[2px_minmax(0,1fr)] items-start gap-x-[clamp(18px,2.5vw,34px)] py-[clamp(18px,2.2vw,26px)] text-left transition-colors duration-200 hover:bg-accent/[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(to right, transparent, var(--rule-2) 40px, var(--rule-2) calc(100% - 40px), transparent)",
              backgroundSize: "100% 1px",
              backgroundRepeat: "no-repeat",
            }}
          >
            <span
              aria-hidden="true"
              className="self-stretch rounded-[2px]"
              style={{ background: active ? "var(--accent)" : "transparent" }}
            />
            <span>
              <span
                className="block font-display text-[clamp(21px,2.4vw,32px)] font-medium leading-[1.12] tracking-[-0.025em] text-balance"
                style={{ color: active ? "var(--ink)" : "rgba(233,237,255,0.66)" }}
              >
                {item.t}
              </span>
              {active && (
                <span
                  className="mt-3.5 block max-w-[72ch] text-[16px] leading-[1.62] text-ink-2"
                  style={{ animation: "vIn .5s cubic-bezier(.16,1,.3,1) both" }}
                >
                  {item.d}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
