import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CircuitBoard, Globe2, Layers, RotateCw, SlidersHorizontal } from "lucide-react";
import { MODULE_ICONS } from "@/components/ui/icons";
import { DataLabel } from "@/components/ui/primitives";
import { DOMAINS, domainPosition } from "@/data/domains";
import { ROADMAP, STAGE_MAP, TRACES } from "@/data/roadmap";
import { useClubStore } from "@/store/useClubStore";
import type { ModuleId } from "@/types";
import { cn } from "@/utils/cn";

/**
 * Full 2D alternative to the WebGL stage. It is used when WebGL is missing,
 * when the visitor switches to the accessible interface, or when the 3D scene
 * throws. Every interaction available in 3D is available here and is fully
 * keyboard operable.
 */
export default function Stage2D() {
  const scene = useClubStore((s) => s.scene);
  return (
    <div className="thin-scroll absolute inset-0 overflow-y-auto pt-16 pb-28 lg:pr-[calc(var(--dock-w)+28px)]">
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col items-center justify-center gap-4 p-4">
        {scene === "globe" && <Globe2D />}
        {scene === "circuit" && <Circuit2D />}
        {scene === "control" && <ControlRoom2D />}
      </div>
    </div>
  );
}

function StageCaption({
  icon,
  title,
  hint,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3 border border-line/80 bg-hull/60 px-3 py-2">
      <div className="flex items-center gap-2.5">
        <span className="grid size-7 place-items-center border border-cyan/40 bg-cyan/10 text-cyan">
          {icon}
        </span>
        <div>
          <p className="font-display text-[11px] tracking-[0.2em] text-ice uppercase">{title}</p>
          <p className="text-[10.5px] text-mute">{hint}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------- globe 2D */

function Globe2D() {
  const activeId = useClubStore((s) => s.activeDomainId);
  const setActiveDomain = useClubStore((s) => s.setActiveDomain);
  const [spin, setSpin] = useState(0);

  const nodes = useMemo(() => {
    const rad = (spin * Math.PI) / 180;
    return DOMAINS.map((d) => {
      const [x, y, z] = domainPosition(d, 34);
      const rx = x * Math.cos(rad) + z * Math.sin(rad);
      const rz = -x * Math.sin(rad) + z * Math.cos(rad);
      return {
        d,
        cx: 50 + rx,
        cy: 50 - y,
        depth: rz,
        front: rz >= 0,
      };
    }).sort((a, b) => a.depth - b.depth);
  }, [spin]);

  return (
    <div className="w-full space-y-3">
      <StageCaption
        icon={<Globe2 size={15} />}
        title="Innovation Globe — 2D"
        hint="Rotate with the slider, then select a domain node."
      >
        <label className="flex items-center gap-2 text-[10.5px] tracking-wide text-mute">
          <RotateCw size={13} className="text-cyan" />
          <span className="font-display tracking-[0.18em] uppercase">Rotate</span>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={spin}
            onChange={(e) => setSpin(Number(e.target.value))}
            aria-label="Rotate the globe"
            className="h-1 w-36 cursor-pointer appearance-none rounded-full bg-line accent-cyan"
          />
          <span className="font-display text-[10px] text-cyan">{spin}°</span>
        </label>
      </StageCaption>

      <div className="relative mx-auto aspect-square w-full max-w-[min(70vh,560px)]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
          <defs>
            <radialGradient id="g2" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="rgba(47,155,255,0.28)" />
              <stop offset="70%" stopColor="rgba(6,14,30,0.35)" />
              <stop offset="100%" stopColor="rgba(3,6,14,0)" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="35" fill="url(#g2)" />
          <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(44,232,255,0.45)" strokeWidth="0.35" />
          {[-22, -11, 0, 11, 22].map((lat) => {
            const ry = Math.sqrt(Math.max(0, 34 * 34 - lat * lat));
            return (
              <ellipse
                key={lat}
                cx="50"
                cy={50 - lat}
                rx={ry}
                ry={ry * 0.22}
                fill="none"
                stroke="rgba(58,169,255,0.22)"
                strokeWidth="0.25"
              />
            );
          })}
          {[0, 30, 60, 90, 120, 150].map((a) => (
            <ellipse
              key={a}
              cx="50"
              cy="50"
              rx={34 * Math.abs(Math.cos((a * Math.PI) / 180)) || 0.4}
              ry="34"
              fill="none"
              stroke="rgba(58,169,255,0.16)"
              strokeWidth="0.25"
            />
          ))}
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(160,107,255,0.25)" strokeWidth="0.25" strokeDasharray="1 2" />
        </svg>

        {nodes.map(({ d, cx, cy, front }) => {
          const active = activeId === d.id;
          const scale = front ? 1 : 0.72;
          return (
            <motion.button
              key={d.id}
              onClick={() => setActiveDomain(active ? null : d.id)}
              aria-pressed={active}
              className={cn(
                "absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 transition-opacity",
                front ? "opacity-100" : "opacity-45"
              )}
              style={{ left: `${cx}%`, top: `${cy}%`, zIndex: active ? 5 : 2 }}
              animate={{ scale: active ? 1.15 : scale }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
            >
              <span
                className="grid size-7 place-items-center border-2"
                style={{
                  borderColor: d.color,
                  background: active ? d.color : `${d.color}22`,
                  boxShadow: active ? `0 0 22px ${d.color}` : `0 0 10px ${d.color}66`,
                  transform: "rotate(45deg)",
                }}
              >
                <span
                  className="block size-1.5"
                  style={{ background: active ? "#03060e" : d.color }}
                />
              </span>
              <span
                className="whitespace-nowrap font-display text-[9.5px] font-bold tracking-[0.12em] uppercase"
                style={{ color: active ? d.color : "#b7c9e4" }}
              >
                {d.name}
              </span>
            </motion.button>
          );
        })}
      </div>
      <p className="text-center text-[11px] text-mute">
        Nodes at the back of the sphere are dimmed, exactly as they are in the 3D view.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------ circuit 2D */

const toBoard = (p: [number, number, number]) => ({
  x: 50 + p[0] * 8.6,
  y: 50 + p[2] * 15,
});

function Circuit2D() {
  const activeId = useClubStore((s) => s.activeStageId);
  const setActiveStage = useClubStore((s) => s.setActiveStage);

  return (
    <div className="w-full space-y-3">
      <StageCaption
        icon={<CircuitBoard size={15} />}
        title="Vision Circuit — 2D"
        hint="Top-down view of the proposed roadmap board. Dependencies light up."
      >
        <span className="font-display text-[9.5px] tracking-[0.2em] text-amber uppercase">
          Proposal
        </span>
      </StageCaption>

      <div className="relative mx-auto aspect-[16/9] w-full max-w-3xl border border-cyan/25 bg-[#06131f]">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
          <defs>
            <pattern id="pcb" width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M6 0H0V6" fill="none" stroke="rgba(21,96,127,0.35)" strokeWidth="0.25" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#pcb)" />
          {TRACES.map(({ from, to }) => {
            const a = toBoard(STAGE_MAP[from].position);
            const b = toBoard(STAGE_MAP[to].position);
            const on = activeId === to || activeId === from;
            return (
              <polyline
                key={`${from}-${to}`}
                points={`${a.x},${a.y} ${a.x},${b.y} ${b.x},${b.y}`}
                fill="none"
                stroke={on ? STAGE_MAP[to].color : "#123a52"}
                strokeWidth={on ? 0.9 : 0.5}
                opacity={on ? 1 : 0.7}
              />
            );
          })}
        </svg>

        {ROADMAP.map((stage) => {
          const { x, y } = toBoard(stage.position);
          const active = activeId === stage.id;
          const isDep = activeId !== null && STAGE_MAP[activeId]?.dependencies.includes(stage.id);
          return (
            <motion.button
              key={stage.id}
              onClick={() => setActiveStage(active ? null : stage.id)}
              aria-pressed={active}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
              style={{ left: `${x}%`, top: `${y}%` }}
              animate={{ scale: active ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}
            >
              <span
                className="grid size-10 place-items-center font-display text-[12px] font-bold"
                style={{
                  color: active ? "#03060e" : stage.color,
                  background: active ? stage.color : `${stage.color}1f`,
                  border: `1.5px solid ${stage.color}`,
                  boxShadow: active || isDep ? `0 0 20px ${stage.color}` : "none",
                  clipPath: "polygon(25% 4%, 75% 4%, 100% 50%, 75% 96%, 25% 96%, 0% 50%)",
                }}
              >
                {String(stage.index).padStart(2, "0")}
              </span>
              <span
                className="max-w-[130px] text-center font-display text-[9.5px] leading-tight font-bold tracking-[0.1em] uppercase"
                style={{ color: active ? stage.color : "#b7c9e4" }}
              >
                {stage.title}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {ROADMAP.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveStage(s.id)}
            className={cn(
              "border p-2.5 text-left transition-colors",
              activeId === s.id ? "border-transparent" : "border-line/80 bg-hull/50 hover:border-cyan/40"
            )}
            style={
              activeId === s.id
                ? { borderColor: s.color, background: `${s.color}14` }
                : undefined
            }
          >
            <DataLabel>Stage {s.index}</DataLabel>
            <p className="mt-0.5 text-[12.5px] font-semibold text-ice">{s.title}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-mute">{s.tagline}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------- control room 2D */

const HUB: Array<{ id: ModuleId; title: string; caption: string; color: string }> = [
  { id: "globe", title: "Innovation Globe", caption: "6 domains", color: "#35e6ff" },
  { id: "circuit", title: "Vision Circuit", caption: "4 stages", color: "#a06bff" },
  { id: "simulator", title: "Build Your Club", caption: "activity simulator", color: "#46f0b0" },
];

function ControlRoom2D() {
  const module = useClubStore((s) => s.module);
  const setModule = useClubStore((s) => s.setModule);

  return (
    <div className="w-full space-y-4">
      <StageCaption
        icon={<Layers size={15} />}
        title="Campaign Control Room — 2D"
        hint="The hub that connects every module. Select one to open it."
      >
        <span className="flex items-center gap-1.5 font-display text-[9.5px] tracking-[0.2em] text-cyan uppercase">
          <SlidersHorizontal size={11} /> {module}
        </span>
      </StageCaption>

      <div className="grid gap-3 sm:grid-cols-3">
        {HUB.map((h, i) => {
          const Icon = MODULE_ICONS[h.id];
          const active = module === h.id;
          return (
            <motion.button
              key={h.id}
              onClick={() => setModule(h.id)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -3 }}
              className={cn(
                "relative overflow-hidden border p-4 text-left transition-colors",
                active ? "bg-panel" : "border-line/80 bg-hull/50 hover:border-cyan/40"
              )}
              style={active ? { borderColor: h.color, boxShadow: `0 0 30px -12px ${h.color}` } : undefined}
              aria-current={active ? "true" : undefined}
            >
              <span
                className="grid size-11 place-items-center border"
                style={{ color: h.color, borderColor: `${h.color}55`, background: `${h.color}12` }}
              >
                <Icon size={20} strokeWidth={1.6} />
              </span>
              <p className="mt-3 font-display text-[12px] font-bold tracking-[0.12em] text-ice uppercase">
                {h.title}
              </p>
              <p className="mt-1 text-[11px] text-mute">{h.caption}</p>
              <span
                className="absolute inset-x-0 bottom-0 h-0.5"
                style={{ background: h.color, opacity: active ? 1 : 0.25 }}
              />
            </motion.button>
          );
        })}
      </div>

      <div className="border border-line/80 bg-hull/50 p-3">
        <DataLabel>Also available</DataLabel>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => setModule("profile")}
            className={cn(
              "border px-3 py-1.5 text-[11.5px] transition-colors",
              module === "profile"
                ? "border-cyan/60 bg-cyan/12 text-cyan"
                : "border-line text-mute hover:border-cyan/40 hover:text-ice"
            )}
          >
            Candidate profile
          </button>
          <button
            onClick={() => setModule("ideas")}
            className={cn(
              "border px-3 py-1.5 text-[11.5px] transition-colors",
              module === "ideas"
                ? "border-cyan/60 bg-cyan/12 text-cyan"
                : "border-line text-mute hover:border-cyan/40 hover:text-ice"
            )}
          >
            Student idea console
          </button>
        </div>
      </div>
    </div>
  );
}
