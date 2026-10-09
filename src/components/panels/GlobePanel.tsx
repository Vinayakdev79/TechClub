import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Crosshair, Plus, RotateCcw, Sparkles } from "lucide-react";
import { DOMAIN_ICONS } from "@/components/ui/icons";
import { Btn, Chip, DataLabel, EmptyState, Panel, ProposalTag, Reveal } from "@/components/ui/primitives";
import { ACTIVITIES, FORMAT_LABEL } from "@/data/activities";
import { DOMAINS, DOMAIN_MAP } from "@/data/domains";
import { useClubStore } from "@/store/useClubStore";
import type { Difficulty } from "@/types";

const LEVEL_COLOR: Record<Difficulty, string> = {
  Beginner: "#46f0b0",
  Intermediate: "#2ce8ff",
  Advanced: "#ffc46b",
};

export function GlobePanel() {
  const activeId = useClubStore((s) => s.activeDomainId);
  const setActiveDomain = useClubStore((s) => s.setActiveDomain);
  const domain = activeId ? DOMAIN_MAP[activeId] : null;

  return (
    <AnimatePresence mode="wait">
      {!domain ? (
        <motion.div
          key="globe-list"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28 }}
        >
          <Panel
            kicker="Module 02 — Innovation Globe"
            title="Six technology domains"
            icon={<Crosshair size={16} />}
            actions={
              <span className="font-display text-[10px] tracking-widest text-mute">
                {DOMAINS.length} NODES
              </span>
            }
          >
            <p className="mb-4 text-xs leading-relaxed text-mute">
              Drag the globe to rotate it, scroll to zoom, then click a glowing node — or pick one
              below. Each node opens a proposal pack: what the domain is, a beginner project, the
              skills it needs and a suggested workshop.
            </p>
            <ul className="space-y-1.5">
              {DOMAINS.map((d, i) => {
                const Icon = DOMAIN_ICONS[d.icon];
                return (
                  <Reveal key={d.id} delay={i * 0.04}>
                    <li>
                      <button
                        onClick={() => setActiveDomain(d.id)}
                        className="group flex w-full items-center gap-3 border border-line/80 bg-hull/50 p-2.5 text-left transition-all duration-200 hover:border-transparent hover:bg-panel"
                        style={{ ["--c" as string]: d.color }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor = `${d.color}88`)
                        }
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
                      >
                        <span
                          className="grid size-9 shrink-0 place-items-center border"
                          style={{ color: d.color, borderColor: `${d.color}44`, background: `${d.color}10` }}
                        >
                          <Icon size={17} strokeWidth={1.7} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-[13px] font-semibold text-ice">
                              {d.name}
                            </span>
                            <span
                              className="shrink-0 px-1 text-[9px] tracking-widest uppercase"
                              style={{ color: LEVEL_COLOR[d.difficulty] }}
                            >
                              {d.difficulty}
                            </span>
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] text-mute">
                            {d.short}
                          </span>
                        </span>
                        <ArrowRight
                          size={15}
                          className="shrink-0 text-mute/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-cyan"
                        />
                      </button>
                    </li>
                  </Reveal>
                );
              })}
            </ul>
            <p className="mt-4 border-t border-line/70 pt-3 text-[11px] leading-relaxed text-mute/80">
              Every project and workshop listed here is a <strong className="text-amber">proposal</strong>{" "}
              for the club to discuss — none of them exist yet.
            </p>
          </Panel>
        </motion.div>
      ) : (
        <motion.div
          key={`globe-${domain.id}`}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28 }}
        >
          <DomainDetail id={domain.id} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DomainDetail({ id }: { id: keyof typeof DOMAIN_MAP }) {
  const domain = DOMAIN_MAP[id];
  const setActiveDomain = useClubStore((s) => s.setActiveDomain);
  const setModule = useClubStore((s) => s.setModule);
  const selected = useClubStore((s) => s.selectedActivities);
  const toggleActivity = useClubStore((s) => s.toggleActivity);
  const refocus = useClubStore((s) => s.refocusCamera);

  const Icon = DOMAIN_ICONS[domain.icon];
  const related = ACTIVITIES.filter((a) => a.domains.includes(domain.id));

  return (
    <div className="space-y-3">
      <Panel
        accent={domain.color}
        kicker={`Domain — ${domain.difficulty}`}
        title={
          <span className="flex items-center gap-2">
            <Icon size={17} style={{ color: domain.color }} />
            {domain.name}
          </span>
        }
        actions={
          <>
            <Btn size="sm" variant="ghost" onClick={refocus} title="Re-fly the camera to this node">
              <Crosshair size={13} /> Focus
            </Btn>
            <Btn size="sm" variant="ghost" onClick={() => setActiveDomain(null)} title="Back to all domains">
              <ArrowLeft size={13} /> All
            </Btn>
          </>
        }
      >
        <p className="text-[13px] leading-relaxed text-ice/90">{domain.explanation}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Stat label="Difficulty" value={domain.difficulty} color={LEVEL_COLOR[domain.difficulty]} />
          <Stat label="Related activities" value={`${related.length} proposed`} color={domain.color} />
        </div>

        <DataLabel className="mt-5">Skills this domain builds</DataLabel>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {domain.skills.map((s) => (
            <span
              key={s}
              className="border px-2 py-1 text-[11px] text-mute"
              style={{ borderColor: `${domain.color}33`, background: `${domain.color}0d` }}
            >
              {s}
            </span>
          ))}
        </div>
      </Panel>

      <Panel accent={domain.color} kicker="Proposed beginner project" title={domain.beginnerProject.title} icon={<Sparkles size={15} />}>
        <ProposalTag className="mb-2" />
        <p className="text-xs leading-relaxed text-mute">{domain.beginnerProject.summary}</p>
        <p className="mt-3 border-l-2 pl-3 text-[12px] leading-relaxed text-ice/85" style={{ borderColor: domain.color }}>
          <span className="font-display text-[9.5px] tracking-[0.2em] text-mute uppercase">
            Intended outcome
          </span>
          <br />
          {domain.beginnerProject.outcome}
        </p>
      </Panel>

      <Panel accent={domain.color} kicker="Suggested workshop" title={domain.workshop.title}>
        <ProposalTag className="mb-3" />
        <dl className="space-y-2 text-xs">
          <Row k="Format" v={domain.workshop.format} />
          <Row k="Length" v={domain.workshop.duration} />
          <Row k="Outcome" v={domain.workshop.outcome} />
        </dl>
      </Panel>

      <Panel
        accent={domain.color}
        kicker="Related learning activities"
        title="Add to your proposed plan"
        actions={
          <Btn size="sm" variant="ghost" onClick={() => setModule("simulator")}>
            Simulator <ArrowRight size={12} />
          </Btn>
        }
      >
        {related.length === 0 ? (
          <EmptyState title="No proposed activity tagged to this domain yet" />
        ) : (
          <ul className="space-y-1.5">
            {related.map((a) => {
              const on = selected.includes(a.id);
              return (
                <li key={a.id}>
                  <div
                    className={`flex items-center gap-2 border p-2 transition-colors ${
                      on ? "border-cyan/45 bg-cyan/8" : "border-line/80 bg-hull/40"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-medium text-ice">
                        {a.name}
                      </span>
                      <span className="block text-[10.5px] text-mute">
                        {a.level} · {FORMAT_LABEL[a.format]}
                      </span>
                    </span>
                    <Chip
                      active={on}
                      color={domain.color}
                      onClick={() => toggleActivity(a.id)}
                      aria-label={`${on ? "Remove" : "Add"} ${a.name} ${on ? "from" : "to"} the plan`}
                    >
                      {on ? <Check /> : <Plus size={12} />}
                      {on ? "In plan" : "Add"}
                    </Chip>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-3 flex items-center gap-2 border-t border-line/70 pt-3">
          <RotateCcw size={12} className="text-mute" />
          <p className="text-[11px] text-mute">
            Selections persist in this browser and feed the planning score in the simulator.
          </p>
        </div>
      </Panel>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="border border-line/80 bg-hull/40 p-2">
      <DataLabel>{label}</DataLabel>
      <p className="mt-1 font-display text-[13px] font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 font-display text-[9.5px] tracking-[0.18em] text-mute uppercase">
        {k}
      </dt>
      <dd className="flex-1 leading-relaxed text-ice/85">{v}</dd>
    </div>
  );
}

function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12.5 9.5 18 20 6.5" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}
