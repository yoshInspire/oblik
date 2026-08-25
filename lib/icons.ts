import {
  Wrench,
  LifeBuoy,
  Gauge,
  Cable,
  Users,
  Palette,
  Building2,
  ShoppingBag,
  LayoutDashboard,
  Rocket,
  Target,
  type LucideIcon,
} from "lucide-react";

/** Иконка на карточку услуги. Ключ — slug из content/services-*.json. */
export const serviceIcons: Record<string, LucideIcon> = {
  "dorabotka-sajta": Wrench,
  "podderzhka-sajta": LifeBuoy,
  "audit-i-uskorenie": Gauge,
  integracii: Cable,
  "vydelennaya-komanda": Users,
  redesign: Palette,
  "korporativnye-sajty": Building2,
  "internet-magazin": ShoppingBag,
  "veb-servisy": LayoutDashboard,
  mvp: Rocket,
  landing: Target,
};

export function serviceIcon(slug: string): LucideIcon {
  return serviceIcons[slug] ?? Wrench;
}
