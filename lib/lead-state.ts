/**
 * Состояние формы заявки живёт отдельно от app/actions.ts намеренно:
 * модуль с директивой "use server" может экспортировать только асинхронные
 * функции. Обычный объект, экспортированный оттуда, приезжает на клиент
 * пустым — форма падает при первом же рендере.
 */
export type LeadState = {
  status: "idle" | "ok" | "error";
  message: string;
  /** Поля, которые нужно подсветить как незаполненные. */
  invalid: string[];
};

export const initialLeadState: LeadState = {
  status: "idle",
  message: "",
  invalid: [],
};
