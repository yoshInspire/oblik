"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  animate,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";

/* ------------------------------------------------------------------
   Плавный скролл. Инерция делает движение страницы заметно мягче,
   но при системной настройке «уменьшить движение» не подключается.
   ------------------------------------------------------------------ */

export function SmoothScroll() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    let frame = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reduce]);

  return null;
}

/* Полоса прогресса чтения — тонкая, у самой кромки окна */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 260, damping: 40, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, transparent, var(--accent), var(--accent-hi))",
      }}
      className="fixed left-0 top-0 z-[60] h-[2px] w-full origin-left"
    />
  );
}

/* ------------------------------------------------------------------
   Появление блоков
   ------------------------------------------------------------------ */

const riseVariants: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function Reveal({
  children,
  index = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const Tag = motion[as];
  return (
    <Tag
      custom={index}
      variants={riseVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className={className}
    >
      {children}
    </Tag>
  );
}

/* Заголовок, который собирается по словам. Только для первого экрана:
   на каждом заголовке страницы это превратилось бы в цирк. */
export function WordsReveal({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");

  return (
    <h1 className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span key={word + i} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{
                duration: 0.85,
                delay: delay + i * 0.055,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </span>
    </h1>
  );
}

/* ------------------------------------------------------------------
   Счётчик: цифры набегают один раз при появлении в поле зрения
   ------------------------------------------------------------------ */

export function Counter({
  to,
  suffix = "",
  className,
}: {
  to: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, to, reduce]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString("ru-RU")}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------
   Бегущая строка. Дублируем содержимое, чтобы стык был незаметен.
   ------------------------------------------------------------------ */

export function Marquee({ items, speed = 42 }: { items: string[]; speed?: number }) {
  const reduce = useReducedMotion();
  const line = [...items, ...items];

  return (
    <div className="relative flex overflow-hidden py-5 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
      <motion.div
        className="flex shrink-0 items-center gap-10 pr-10"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
      >
        {line.map((item, i) => (
          <span key={item + i} className="flex shrink-0 items-center gap-10">
            <span className="label text-ink-3 whitespace-nowrap">{item}</span>
            <span className="h-1 w-1 shrink-0 rounded-full bg-accent" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Параллакс: блок движется медленнее страницы
   ------------------------------------------------------------------ */

export function Parallax({
  children,
  distance = 60,
  className,
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Магнитная кнопка: слегка тянется к курсору
   ------------------------------------------------------------------ */

export function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 240, damping: 18 });
  const sy = useSpring(y, { stiffness: 240, damping: 18 });

  const onMove = (event: React.MouseEvent<HTMLSpanElement>) => {
    if (reduce) return;
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * 0.22);
    y.set((event.clientY - (rect.top + rect.height / 2)) * 0.28);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy, display: "inline-block" }}
    >
      {children}
    </motion.span>
  );
}

/* Подсветка карточки под курсором */
export function Spotlight({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -400, y: -400 });

  return (
    <div
      ref={ref}
      onMouseMove={(event) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        setPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
      }}
      onMouseLeave={() => setPos({ x: -400, y: -400 })}
      className={className}
      style={
        {
          "--mx": `${pos.x}px`,
          "--my": `${pos.y}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
