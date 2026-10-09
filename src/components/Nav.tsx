import { motion } from "framer-motion";
import {
  Accessibility,
  Eye,
  Gauge,
  Layers,
  MonitorSmartphone,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { MODULE_ICONS } from "@/components/ui/icons";
import { MODULE_LABEL, useClubStore } from "@/store/useClubStore";
import type { ModuleId } from "@/types";
import { cn } from "@/utils/cn";

const MODULES: ModuleId[] = ["profile", "globe", "circuit", "simulator", "ideas"];
const TIERS = ["high", "balanced", "lite"] as const;
const TIER_LABEL = { high: "HQ", balanced: "BAL", lite: "LITE" } as const;

/* ------------------------------------------------------------- brand mark */

export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id="bm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2ce8ff" />
          <stop offset="100%" stopColor="#a06bff" />
        </linearGradient>
      </defs>
      <path
        d="M20 2.5 35.5 11v18L20 37.5 4.5 29V11z"
        fill="none"
        stroke="url(#bm)"
        strokeWidth="1.6"
      />
      <path d="M20 7 31.5 13.5v13L20 33 8.5 26.5v-13z" fill="rgba(44,232,255,0.07)" />
      <text
        x="20"
        y="24.5"
        textAnchor="middle"
        fontFamily="Orbitron, sans-serif"
        fontSize="11"
        fontWeight="700"
        fill="#e9f3ff"
        letterSpacing="0.5"
      >
        VK
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ top bar */

export function TopBar({
  panelOpen,
  onTogglePanel,
}: {
  panelOpen: boolean;
  onTogglePanel: () => void;
}) {
  const module = useClubStore((s) => s.module);
  const setModule = useClubStore((s) => s.setModule);
  const view2D = useClubStore((s) => s.view2D);
  const setView2D = useClubStore((s) => s.setView2D);
  const reducedMotion = useClubStore((s) => s.reducedMotion);
  const setReducedMotion = useClubStore((s) => s.setReducedMotion);
  const capability = useClubStore((s) => s.capability);
  const setCapability = useClubStore((s) => s.setCapability);
  const webglAvailable = useClubStore((s) => s.webglAvailable);

  return (
    <header className="pointer-events-auto absolute inset-x-0 top-0 z-40">
      <div className="relative flex items-center gap-2 border-b border-line/80 bg-void/80 px-2.5 py-2 backdrop-blur-md sm:gap-4 sm:px-4">
        {/* brand */}
        <button
          onClick={() => setModule("profile")}
          className="group flex shrink-0 items-center gap-2.5 text-left"
          aria-label="Go to candidate overview"
        >
          <span className="transition-transform duration-500 group-hover:rotate-180">
            <BrandMark size={30} />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block font-display text-[12.5px] font-bold tracking-[0.16em] text-ice">
              VINAYAK KATIYAR
            </span>
            <span className="block text-[9.5px] tracking-[0.22em] text-mute uppercase">
              President candidate · Advance Tech Club
            </span>
          </span>
        </button>

        <div className="mx-1 hidden h-7 w-px bg-line lg:block" />

        {/* module tabs */}
        <nav aria-label="Campaign modules" className="min-w-0 flex-1">
          <ul className="thin-scroll flex items-center gap-1 overflow-x-auto">
            {MODULES.map((m, i) => {
              const Icon = MODULE_ICONS[m];
              const active = module === m;
              return (
                <li key={m} className="shrink-0">
                  <button
                    onClick={() => setModule(m)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-2 border px-2.5 py-2 text-[11px] tracking-wide transition-all duration-200 sm:px-3",
                      active
                        ? "border-cyan/50 bg-cyan/12 text-cyan"
                        : "border-transparent text-mute hover:border-line hover:bg-panel/60 hover:text-ice"
                    )}
                  >
                    <Icon size={15} strokeWidth={1.8} />
                    <span className="hidden md:inline">{MODULE_LABEL[m]}</span>
                    <span className="font-display text-[9px] text-mute/60 md:hidden">
                      {i + 1}
                    </span>
                    {active && (
                      <motion.span
                        layoutId="tab-underline"
                        className="absolute inset-x-0 -bottom-[9px] h-px bg-cyan shadow-[0_0_10px_#2ce8ff]"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* utilities */}
        <div className="flex shrink-0 items-center gap-1">
          <UtilityButton
            label="2D interface"
            title={
              webglAvailable
                ? "Switch to the accessible 2D interface (shortcut: V)"
                : "WebGL unavailable — 2D interface is active"
            }
            active={view2D}
            disabled={!webglAvailable}
            onClick={() => setView2D(!view2D)}
          >
            <Layers size={15} />
          </UtilityButton>
          <UtilityButton
            label="Reduced motion"
            title="Reduce or stop animation (respects your system setting)"
            active={reducedMotion}
            onClick={() => setReducedMotion(!reducedMotion)}
          >
            <Accessibility size={15} />
          </UtilityButton>
          <button
            onClick={() => {
              const next = TIERS[(TIERS.indexOf(capability) + 1) % TIERS.length];
              setCapability(next);
            }}
            title="Graphics quality — cycles High / Balanced / Lite"
            aria-label={`Graphics quality: ${capability}. Activate to change.`}
            className={cn(
              "flex items-center gap-1.5 border px-2 py-2 text-[10px] tracking-widest transition-colors",
              capability === "lite"
                ? "border-amber/50 bg-amber/10 text-amber"
                : "border-line text-mute hover:border-cyan/40 hover:text-ice"
            )}
          >
            <Gauge size={14} />
            <span className="font-display">{TIER_LABEL[capability]}</span>
          </button>
          <UtilityButton
            label="Toggle panel"
            title={panelOpen ? "Hide the information panel" : "Show the information panel"}
            onClick={onTogglePanel}
            className="hidden sm:flex"
          >
            {panelOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
          </UtilityButton>
        </div>
      </div>

      {/* status scan line */}
      <div className="relative h-px w-full overflow-hidden bg-line/60">
        <motion.div
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan to-transparent"
          animate={{ x: ["-100%", "400%"] }}
          transition={{ duration: reducedMotion ? 0 : 7, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </header>
  );
}

function UtilityButton({
  children,
  label,
  title,
  active,
  disabled,
  onClick,
  className,
}: {
  children: React.ReactNode;
  label: string;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center border p-2 transition-colors disabled:cursor-not-allowed",
        active
          ? "border-cyan/55 bg-cyan/12 text-cyan"
          : "border-line text-mute hover:border-cyan/40 hover:text-ice",
        disabled && "opacity-60",
        className
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------- status bar */

export function StatusBar() {
  const module = useClubStore((s) => s.module);
  const scene = useClubStore((s) => s.scene);
  const view2D = useClubStore((s) => s.view2D);
  const activeDomainId = useClubStore((s) => s.activeDomainId);
  const activeStageId = useClubStore((s) => s.activeStageId);
  const selected = useClubStore((s) => s.selectedActivities);
  const ideas = useClubStore((s) => s.ideas);
  const capability = useClubStore((s) => s.capability);
  const sceneStatus = useClubStore((s) => s.sceneStatus);

  const state = view2D
    ? "2D INTERFACE"
    : sceneStatus === "ready"
      ? "3D ONLINE"
      : sceneStatus === "error"
        ? "3D UNAVAILABLE"
        : "BOOTING 3D";

  return (
    <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-30">
      <div className="overflow-hidden border-y border-line/60 bg-void/70 py-1 backdrop-blur-sm">
        <div className="ticker-track flex w-max gap-10 whitespace-nowrap font-display text-[9.5px] tracking-[0.28em] text-mute/70 uppercase">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex gap-10">
              <span>All projects, workshops and calendar entries on this site are proposals</span>
              <span className="text-cyan/50">◆</span>
              <span>Ideas are saved locally in your browser only — local demo, not a live submission</span>
              <span className="text-cyan/50">◆</span>
              <span>Scores measure plan coverage, they do not predict real-world results</span>
              <span className="text-cyan/50">◆</span>
              <span>Learn. Build. Innovate. Together.</span>
              <span className="text-cyan/50">◆</span>
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-line/80 bg-void/85 px-3 py-1.5 text-[10px] tracking-wide text-mute backdrop-blur-md sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1.5">
            <span
              className={cn(
                "size-1.5 rounded-full",
                sceneStatus === "ready" || view2D ? "bg-mint blink" : "bg-amber"
              )}
            />
            <span className="font-display tracking-[0.2em] uppercase">{state}</span>
          </span>
          <span className="hidden truncate sm:inline">
            MODULE <span className="text-ice">{MODULE_LABEL[module]}</span>
          </span>
          <span className="hidden lg:inline">
            SCENE <span className="text-ice">{scene.toUpperCase()}</span>
          </span>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Telemetry label="DOMAIN" value={activeDomainId ? activeDomainId.toUpperCase() : "—"} />
          <Telemetry label="STAGE" value={activeStageId ? activeStageId.toUpperCase() : "—"} />
          <Telemetry label="PLAN" value={`${selected.length} SEL`} />
          <Telemetry label="IDEAS" value={`${ideas.length} LOCAL`} />
          <Telemetry label="GPU" value={capability.toUpperCase()} />
        </div>

        <div className="pointer-events-auto hidden items-center gap-2 lg:flex">
          <span className="flex items-center gap-1.5 text-mute/80">
            <MonitorSmartphone size={12} />
            Drag to rotate · Scroll to zoom · Click a node
          </span>
          <span className="flex items-center gap-1 border border-line px-1.5 py-0.5 font-display text-[9px] tracking-widest text-mute">
            <Eye size={11} /> 1–5 MODULES · ESC CLEAR · V 2D
          </span>
        </div>
      </div>
    </footer>
  );
}

function Telemetry({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="font-display text-[9px] tracking-[0.2em] text-mute/70">{label}</span>
      <span className="font-display text-[10px] text-cyan">{value}</span>
    </span>
  );
}
