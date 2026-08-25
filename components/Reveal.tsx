"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Задержка внутри группы, мс. Шаг между соседями — 80. */
  delay?: number;
  className?: string;
};

/**
 * Появление при скролле. Срабатывает один раз: повторные полёты блоков
 * при каждом проходе раздражают уже через минуту на странице.
 * При системной настройке «уменьшить движение» блок просто показывается.
 */
export default function Reveal({ children, delay = 0, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      node.classList.add("is-in");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          target.style.transitionDelay = `${delay}ms`;
          target.classList.add("is-in");
          observer.unobserve(target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`reveal ${className}`.trim()}>
      {children}
    </div>
  );
}
