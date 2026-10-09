import {
  Brain,
  Bot,
  Wifi,
  Code2,
  Cpu,
  ShieldCheck,
  Globe2,
  CircuitBoard,
  SlidersHorizontal,
  MessageSquareText,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { DomainIconKey, ModuleId } from "@/types";

/** Static icon registries — avoids dynamic imports and keeps the bundle tidy. */
export const DOMAIN_ICONS: Record<DomainIconKey, LucideIcon> = {
  brain: Brain,
  robot: Bot,
  wifi: Wifi,
  code: Code2,
  chip: Cpu,
  shield: ShieldCheck,
};

export const MODULE_ICONS: Record<ModuleId, LucideIcon> = {
  profile: UserRound,
  globe: Globe2,
  circuit: CircuitBoard,
  simulator: SlidersHorizontal,
  ideas: MessageSquareText,
};
