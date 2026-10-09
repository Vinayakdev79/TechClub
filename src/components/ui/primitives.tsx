import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/* ------------------------------------------------------------------ Panel */

interface PanelProps {
  kicker?: string;
  title?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  accent?: string;
}

export function Panel({
  kicker,
  title,
  icon,
  actions,
  children,
  className,
  bodyClassName,
  accent = "#2ce8ff",
}: PanelProps) {
  return (
    <section
      className={cn("hud hud-corner scanlines relative", className)}
      style={{ borderColor: `${accent}2e` }}
    >
      {(kicker || title) && (
        <header className="flex items-start gap-3 border-b border-line/80 px-4 py-3 sm:px-5">
          {icon && (
            <span
              className="mt-0.5 grid size-8 shrink-0 place-items-center border"
              style={{
                color: accent,
                borderColor: `${accent}44`,
                background: `${accent}12`,
              }}
            >
              {icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            {kicker && (
              <p
                className="font-display text-[10px] tracking-[0.28em] uppercase"
                style={{ color: accent }}
              >
                {kicker}
              </p>
            )}
            {title && (
              <h2 className="mt-0.5 truncate text-base font-semibold text-ice sm:text-lg">
                {title}
              </h2>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
        </header>
      )}
      <div className={cn("px-4 py-4 sm:px-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/* ----------------------------------------------------------------- Button */

type BtnProps = HTMLMotionProps<"button"> & {
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md";
  active?: boolean;
};

export function Btn({
  variant = "outline",
  size = "md",
  active,
  className,
  children,
  ...rest
}: BtnProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 border font-medium tracking-wide transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40",
        size === "sm" ? "px-2.5 py-1.5 text-[11px]" : "px-3.5 py-2 text-xs",
        variant === "primary" &&
          "border-cyan/60 bg-cyan/15 text-cyan hover:bg-cyan/25 hover:shadow-[0_0_24px_-6px_rgba(44,232,255,0.8)]",
        variant === "outline" &&
          "border-line bg-panel/60 text-mute hover:border-cyan/45 hover:text-ice",
        variant === "ghost" && "border-transparent bg-transparent text-mute hover:text-ice",
        variant === "danger" &&
          "border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20",
        active && "border-cyan/70 bg-cyan/20 text-cyan",
        className
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/* ------------------------------------------------------------------- Chip */

export function Chip({
  active,
  color,
  children,
  className,
  ...rest
}: HTMLMotionProps<"button"> & { active?: boolean; color?: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px] tracking-wide transition-all duration-200",
        active
          ? "border-transparent text-void"
          : "border-line bg-hull/70 text-mute hover:border-cyan/40 hover:text-ice",
        className
      )}
      style={
        active
          ? { backgroundColor: color ?? "#2ce8ff", boxShadow: `0 0 18px -4px ${color ?? "#2ce8ff"}` }
          : undefined
      }
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ Meter */

export function Meter({
  label,
  value,
  max,
  color = "#2ce8ff",
  caption,
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
  caption?: string;
}) {
  const pct = max === 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] tracking-wide text-mute uppercase">{label}</span>
        <span className="font-display text-[11px] text-ice">
          {value.toFixed(1)}
          <span className="text-mute">/{max}</span>
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden bg-line/70">
        <motion.div
          className="h-full"
          style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
        />
      </div>
      {caption && <p className="mt-1 text-[10.5px] leading-snug text-mute/80">{caption}</p>}
    </div>
  );
}

/* ------------------------------------------------------------- ScoreRing */

export function ScoreRing({
  value,
  size = 108,
  label,
  color = "#2ce8ff",
}: {
  value: number;
  size?: number;
  label?: string;
  color?: string;
}) {
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value)) / 100;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(23,38,63,0.9)"
          strokeWidth={6}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-2xl leading-none font-bold text-ice">{value}</div>
        {label && (
          <div className="mt-1 text-[9px] tracking-[0.2em] text-mute uppercase">{label}</div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- Reveal */

export function Reveal({
  children,
  delay = 0,
  className,
  y = 12,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------ EmptyState */

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 border border-dashed border-line px-4 py-8 text-center">
      {icon && <span className="text-cyan/60">{icon}</span>}
      <p className="text-sm font-medium text-ice">{title}</p>
      {hint && <p className="max-w-xs text-xs leading-relaxed text-mute">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------- DataLabel */

export function DataLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("font-display text-[10px] tracking-[0.24em] text-mute uppercase", className)}>
      {children}
    </p>
  );
}

export function ProposalTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border border-amber/40 bg-amber/10 px-1.5 py-0.5 font-display text-[9px] tracking-[0.18em] text-amber uppercase",
        className
      )}
    >
      Proposal
    </span>
  );
}
