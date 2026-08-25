"use client";

import { useActionState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { CircleAlert, CircleCheck, Loader2 } from "lucide-react";
import { submitLead } from "@/app/actions";
import { initialLeadState } from "@/lib/lead-state";
import { site } from "@/lib/content";

function Submit() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Отправляем…
        </>
      ) : (
        site.contacts.form.submit
      )}
    </button>
  );
}

export default function LeadForm({ title, lead }: { title?: string; lead?: string }) {
  const [state, action] = useActionState(submitLead, initialLeadState);
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "ok") formRef.current?.reset();
    if (state.status !== "idle") alertRef.current?.focus();
  }, [state]);

  const budget = site.contacts.form.fields.find((f) => f.name === "budget") as
    | { options?: string[] }
    | undefined;

  const invalid = (name: string) => (state.invalid.includes(name) ? "!border-stop" : "");

  return (
    <form
      ref={formRef}
      action={action}
      noValidate
      className="panel self-start p-[clamp(24px,2.4vw,32px)]"
    >
      <span className="label block text-ink-3">{site.contacts.form.title}</span>
      <h2 className="mt-3.5 text-[clamp(22px,2vw,28px)] leading-[1.18] text-ink">
        {title ?? "Расскажите, что нужно сделать"}
      </h2>
      <p className="mt-3.5 max-w-[46ch] text-[15px] leading-[1.6] text-ink-2">
        {lead ?? "Чем конкретнее задача, тем точнее оценка. Ответим в течение рабочего дня."}
      </p>

      <input type="hidden" name="page" value={pathname} />

      {/* Ловушка для ботов: скрыта от людей, заполняется автозаполнением */}
      <div className="absolute left-[-9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="company">Не заполняйте это поле</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-[26px] grid gap-[18px]">
        <label className="grid gap-2" htmlFor="task">
          <span className="text-[14px] text-ink-2">Что нужно сделать</span>
          <textarea
            id="task"
            name="task"
            rows={3}
            required
            placeholder="Пара предложений о задаче. Если есть сайт — дайте ссылку."
            className={`field-input resize-y ${invalid("task")}`}
          />
        </label>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <label className="grid gap-2" htmlFor="contact">
            <span className="text-[14px] text-ink-2">Как с вами связаться</span>
            <input
              id="contact"
              name="contact"
              type="text"
              required
              autoComplete="email"
              placeholder="Телефон, почта или Telegram"
              className={`field-input ${invalid("contact")}`}
            />
          </label>

          {budget?.options && (
            <label className="grid gap-2" htmlFor="budget">
              <span className="text-[14px] text-ink-2">Ориентир по бюджету</span>
              <select
                id="budget"
                name="budget"
                defaultValue={budget.options[0]}
                className="field-input appearance-none"
              >
                {budget.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <label
          className={`flex cursor-pointer items-start gap-3 text-[14px] leading-[1.55] ${
            state.invalid.includes("consent") ? "text-stop" : "text-ink-2"
          }`}
        >
          <input
            type="checkbox"
            name="consent"
            value="yes"
            required
            className="mt-0.5 h-[17px] w-[17px] shrink-0 accent-[var(--accent)]"
          />
          <span>
            Согласен на обработку персональных данных в соответствии с{" "}
            <a href="/privacy/" className="text-accent-hi underline underline-offset-[3px]">
              политикой конфиденциальности
            </a>
          </span>
        </label>
      </div>

      <div className="mt-[26px] flex flex-wrap items-center gap-x-5 gap-y-3">
        <Submit />
        <span className="text-[14.5px] text-ink-3">
          или напишите напрямую{" "}
          <a
            href={`mailto:${site.brand.contacts.email}`}
            className="text-accent-hi transition-colors hover:text-ink"
          >
            {site.brand.contacts.email}
          </a>
        </span>
      </div>

      <AnimatePresence>
        {state.status !== "idle" && (
          <motion.div
            ref={alertRef}
            tabIndex={-1}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 flex items-start gap-3 rounded-lg border p-4 text-[15px] leading-[1.6] text-ink"
            style={
              state.status === "ok"
                ? {
                    borderColor: "color-mix(in srgb, var(--accent) 60%, transparent)",
                    background: "color-mix(in srgb, var(--accent) 12%, transparent)",
                  }
                : {
                    borderColor: "color-mix(in srgb, var(--stop) 50%, transparent)",
                    background: "color-mix(in srgb, var(--stop) 10%, transparent)",
                  }
            }
          >
            {state.status === "ok" ? (
              <CircleCheck size={18} className="mt-0.5 shrink-0 text-accent-hi" />
            ) : (
              <CircleAlert size={18} className="mt-0.5 shrink-0 text-stop" />
            )}
            <span>{state.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
