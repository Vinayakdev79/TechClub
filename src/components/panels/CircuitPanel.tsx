import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CircuitBoard,
  Flag,
  Link2,
  ListChecks,
  Target,
  TriangleAlert,
} from "lucide-react";
import { DOMAIN_ICONS } from "@/components/ui/icons";
import { Btn, Chip, DataLabel, Panel, ProposalTag, Reveal } from "@/components/ui/primitives";
import { DOMAIN_MAP } from "@/data/domains";
import { ROADMAP, ROADMAP_DISCLAIMER, STAGE_MAP } from "@/data/roadmap";
import { useClubStore } from "@/store/useClubStore";

export function CircuitPanel() {
  const activeId = useClubStore((s) => s.activeStageId);
  const setActiveStage = useClubStore((s) => s.setActiveStage);
  const setActiveDomain = useClubStore((s) => s.setActiveDomain);
  const refocus = useClubStore((s) => s.refocusCamera);

  /* exploration tracker — session scoped, purely informational */
  const [explored, setExplored] = useState<string[]>([]);
  useEffect(() => {
    if (activeId && !explored.includes(activeId)) {
      setExplored((e) => [...e, activeId]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const active = activeId ? STAGE_MAP[activeId] : null;

  return (
    <div className="space-y-3">
      {/* disclaimer */}
      <div className="flex items-start gap-2.5 border border-amber/35 bg-amber/8 p-3">
        <TriangleAlert size={15} className="mt-0.5 shrink-0 text-amber" />
        <p className="text-[11.5px] leading-relaxed text-amber/90">{ROADMAP_DISCLAIMER}</p>
      </div>

      <Panel
        kicker="Module 03 — Vision Circuit"
        title="Proposed term roadmap"
        icon={<CircuitBoard size={16} />}
        accent="#a06bff"
        actions={
          active ? (
            <Btn size="sm" variant="ghost" onClick={() => setActiveStage(null)}>
              Board view
            </Btn>
          ) : (
            <span className="font-display text-[10px] tracking-widest text-mute">
              {explored.length}/{ROADMAP.length} SEEN
            </span>
          )
        }
      >
        <p className="mb-3 text-xs leading-relaxed text-mute">
          Four stages wired like a circuit board. Click any node — in 3D or below — to fly the
          camera to it and energise the traces leading into it. No stage is locked; explore in any
          order.
        </p>

        <ol className="space-y-1.5">
          {ROADMAP.map((stage, i) => {
            const on = stage.id === activeId;
            const seen = explored.includes(stage.id);
            return (
              <Reveal key={stage.id} delay={i * 0.05}>
                <li>
                  <button
                    onClick={() => setActiveStage(on ? null : stage.id)}
                    aria-current={on ? "step" : undefined}
                    className="group flex w-full items-center gap-3 border p-2.5 text-left transition-all duration-200"
                    style={{
                      borderColor: on ? stage.color : "rgba(23,38,63,0.9)",
                      background: on ? `${stage.color}14` : "rgba(6,12,26,0.5)",
                    }}
                  >
                    <span
                      className="grid size-8 shrink-0 place-items-center font-display text-[12px] font-bold transition-colors"
                      style={{
                        color: on ? "#03060e" : stage.color,
                        background: on ? stage.color : "transparent",
                        border: `1px solid ${stage.color}66`,
                      }}
                    >
                      {String(stage.index).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-semibold text-ice">
                          {stage.title}
                        </span>
                        {seen && !on && (
                          <span className="font-display text-[8.5px] tracking-widest text-mute/60 uppercase">
                            seen
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-mute">
                        {stage.tagline}
                      </span>
                    </span>
                    <ArrowRight
                      size={15}
                      className="shrink-0 text-mute/40 transition-transform group-hover:translate-x-0.5 group-hover:text-ice"
                    />
                  </button>
                </li>
              </Reveal>
            );
          })}
        </ol>

        <div className="mt-3 flex items-center gap-2">
          <Btn size="sm" variant="outline" onClick={refocus}>
            <Target size={12} /> Re-fly camera
          </Btn>
          <Btn size="sm" variant="ghost" onClick={() => setExplored([])}>
            Reset tracker
          </Btn>
        </div>
      </Panel>

      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.26 }}
            className="space-y-3"
          >
            <Panel accent={active.color} kicker={`Stage ${active.index} of ${ROADMAP.length}`} title={active.title}>
              <ProposalTag className="mb-3" />
              <DataLabel>Objective</DataLabel>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ice/90">{active.objective}</p>

              <DataLabel className="mt-5">Action steps</DataLabel>
              <ol className="mt-2 space-y-1.5">
                {active.actions.map((a, i) => (
                  <li key={i} className="flex gap-2.5 text-[12px] leading-relaxed text-mute">
                    <span
                      className="mt-0.5 grid size-4 shrink-0 place-items-center font-display text-[9px]"
                      style={{ color: active.color, border: `1px solid ${active.color}55` }}
                    >
                      {i + 1}
                    </span>
                    {a}
                  </li>
                ))}
              </ol>
            </Panel>

            <Panel accent={active.color} kicker="Wiring" title="Dependencies" icon={<Link2 size={15} />}>
              {active.dependencies.length === 0 ? (
                <p className="text-xs leading-relaxed text-mute">
                  No dependencies — this is the entry point of the roadmap. It can start as soon as
                  the club agrees on it.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {active.dependencies.map((dep) => {
                    const s = STAGE_MAP[dep];
                    return (
                      <Chip key={dep} color={s.color} onClick={() => setActiveStage(dep)}>
                        <span className="font-display text-[9px]">
                          {String(s.index).padStart(2, "0")}
                        </span>
                        {s.title}
                      </Chip>
                    );
                  })}
                </div>
              )}
              <p className="mt-3 text-[11px] leading-relaxed text-mute/80">
                The glowing traces on the board are these dependencies. Selecting a stage lights the
                traces that feed into it and raises the chips it depends on.
              </p>
            </Panel>

            <Panel accent={active.color} kicker="Output" title="Expected deliverable" icon={<Flag size={15} />}>
              <p className="text-[13px] leading-relaxed text-ice/90">{active.deliverable}</p>
              <DataLabel className="mt-5">Completion criteria</DataLabel>
              <ul className="mt-2 space-y-1.5">
                {active.completionCriteria.map((c) => (
                  <li key={c} className="flex gap-2 text-[12px] leading-relaxed text-mute">
                    <ListChecks size={13} className="mt-0.5 shrink-0" style={{ color: active.color }} />
                    {c}
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel accent={active.color} kicker="Technology touched" title="Related domains">
              <div className="flex flex-wrap gap-1.5">
                {active.relatedDomains.map((d) => {
                  const domain = DOMAIN_MAP[d];
                  const Icon = DOMAIN_ICONS[domain.icon];
                  return (
                    <Chip
                      key={d}
                      color={domain.color}
                      onClick={() => setActiveDomain(d)}
                      aria-label={`Open ${domain.name} on the Innovation Globe`}
                    >
                      <Icon size={12} /> {domain.name}
                    </Chip>
                  );
                })}
              </div>
              <p className="mt-3 text-[11px] text-mute/80">
                Selecting a domain flies the camera back to the Innovation Globe and opens its
                proposal pack.
              </p>
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
