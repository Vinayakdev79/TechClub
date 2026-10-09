import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, Lightbulb, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { DOMAIN_ICONS } from "@/components/ui/icons";
import {
  Btn,
  Chip,
  DataLabel,
  EmptyState,
  Meter,
  Panel,
  ProposalTag,
  ScoreRing,
} from "@/components/ui/primitives";
import { ACTIVITIES, FORMAT_LABEL, LEVELS } from "@/data/activities";
import { DOMAIN_MAP, DOMAINS } from "@/data/domains";
import { scorePlan, scoreVerdict, suggestNext, SCORE_RULES } from "@/lib/scoring";
import { useClubStore } from "@/store/useClubStore";
import type { Difficulty, LevelFilter } from "@/types";
import { cn } from "@/utils/cn";

const LEVEL_COLOR: Record<Difficulty, string> = {
  Beginner: "#46f0b0",
  Intermediate: "#2ce8ff",
  Advanced: "#ffc46b",
};

export function SimulatorPanel() {
  const selected = useClubStore((s) => s.selectedActivities);
  const toggleActivity = useClubStore((s) => s.toggleActivity);
  const clearActivities = useClubStore((s) => s.clearActivities);
  const levelFilter = useClubStore((s) => s.levelFilter);
  const setLevelFilter = useClubStore((s) => s.setLevelFilter);
  const setActiveDomain = useClubStore((s) => s.setActiveDomain);
  const [expanded, setExpanded] = useState<string | null>(null);

  const score = useMemo(() => scorePlan(selected), [selected]);
  const verdict = scoreVerdict(score.total);
  const suggestions = useMemo(() => suggestNext(selected), [selected]);

  const visible = useMemo(
    () =>
      ACTIVITIES.filter(
        (a) => levelFilter === "all" || a.level === levelFilter
      ),
    [levelFilter]
  );

  const filters: Array<{ id: LevelFilter; label: string }> = [
    { id: "all", label: "All levels" },
    ...LEVELS.map((l) => ({ id: l as LevelFilter, label: l })),
  ];

  return (
    <div className="space-y-3">
      {/* ---------------------------------------------------------- score */}
      <Panel
        kicker="Module 04 — Build Your Club"
        title="Proposed activity plan"
        icon={<SlidersHorizontal size={16} />}
        accent="#46f0b0"
        actions={
          <Btn size="sm" variant="ghost" onClick={clearActivities} disabled={selected.length === 0}>
            <RotateCcw size={12} /> Reset
          </Btn>
        }
      >
        <div className="flex items-center gap-4">
          <ScoreRing value={score.total} label="plan score" color="#46f0b0" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-bold tracking-wide text-ice">
              {verdict.label}
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-mute">{verdict.hint}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.entries(score.levelCounts).map(([lvl, count]) => (
                <span
                  key={lvl}
                  className="border px-1.5 py-0.5 font-display text-[9.5px] tracking-widest uppercase"
                  style={{
                    color: count > 0 ? LEVEL_COLOR[lvl as Difficulty] : "#5b7192",
                    borderColor: count > 0 ? `${LEVEL_COLOR[lvl as Difficulty]}55` : "#17263f",
                  }}
                >
                  {lvl.slice(0, 3)} {count}
                </span>
              ))}
              <span className="border border-line px-1.5 py-0.5 font-display text-[9.5px] tracking-widest text-mute uppercase">
                {score.formatCount}/6 formats
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3 border-t border-line/70 pt-4">
          <Meter
            label="Domain coverage"
            value={score.coverage}
            max={score.coverageMax}
            color="#2ce8ff"
            caption={`${score.coveredDomains.length}/${DOMAINS.length} domains touched → (covered ÷ 6) × 40`}
          />
          <Meter
            label="Level balance"
            value={score.balance}
            max={score.balanceMax}
            color="#46f0b0"
            caption="(1 − (max − min) ÷ total) × 25 across Beginner / Intermediate / Advanced"
          />
          <Meter
            label="Format variety"
            value={score.formats}
            max={score.formatsMax}
            color="#a06bff"
            caption="(unique formats ÷ 6) × 20 — workshop, competition, demo, showcase, talk, peer"
          />
          <Meter
            label="Plan size"
            value={score.size}
            max={score.sizeMax}
            color="#ffc46b"
            caption={`min(activities ÷ ${SCORE_RULES.sizeFullAt}, 1) × 15`}
          />
        </div>

        <p className="mt-3 border-l-2 border-amber/50 pl-3 text-[11px] leading-relaxed text-mute">
          This score measures the <strong className="text-ice">coverage and diversity</strong> of a
          proposed plan. It is not a prediction of attendance, success or support.
        </p>
      </Panel>

      {/* ----------------------------------------------------- suggestions */}
      <Panel kicker="Computed next step" title="What the rules suggest" icon={<Lightbulb size={15} />} accent="#2ce8ff">
        <ul className="space-y-1.5">
          {suggestions.map((s) => (
            <li key={s} className="flex gap-2 text-[12px] leading-relaxed text-mute">
              <span className="mt-1.5 size-1 shrink-0 bg-cyan" />
              {s}
            </li>
          ))}
        </ul>
        {score.missingDomains.length > 0 && (
          <>
            <DataLabel className="mt-4">Untouched domains</DataLabel>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {score.missingDomains.map((d) => {
                const domain = DOMAIN_MAP[d];
                const Icon = DOMAIN_ICONS[domain.icon];
                return (
                  <Chip key={d} color={domain.color} onClick={() => setActiveDomain(d)}>
                    <Icon size={12} /> {domain.name}
                  </Chip>
                );
              })}
            </div>
          </>
        )}
      </Panel>

      {/* ------------------------------------------------------- catalogue */}
      <Panel
        kicker="Proposed activities"
        title="Select what the club should run"
        accent="#2f9bff"
        actions={
          <span className="font-display text-[10px] tracking-widest text-cyan">
            {selected.length} SELECTED
          </span>
        }
      >
        <ProposalTag className="mb-3" />
        <div className="mb-3 flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <Chip
              key={f.id}
              active={levelFilter === f.id}
              color={f.id === "all" ? "#2ce8ff" : LEVEL_COLOR[f.id as Difficulty]}
              onClick={() => setLevelFilter(f.id)}
            >
              {f.label}
            </Chip>
          ))}
        </div>

        {visible.length === 0 ? (
          <EmptyState title="No activities at this level" hint="Try another filter." />
        ) : (
          <ul className="space-y-1.5">
            {visible.map((a) => {
              const on = selected.includes(a.id);
              const open = expanded === a.id;
              return (
                <li
                  key={a.id}
                  className={cn(
                    "border transition-colors duration-200",
                    on ? "border-mint/50 bg-mint/8" : "border-line/80 bg-hull/40 hover:border-cyan/35"
                  )}
                >
                  <div className="flex items-start gap-2 p-2.5">
                    <button
                      onClick={() => toggleActivity(a.id)}
                      aria-pressed={on}
                      aria-label={`${on ? "Remove" : "Add"} ${a.name}`}
                      className={cn(
                        "mt-0.5 grid size-5 shrink-0 place-items-center border transition-all",
                        on
                          ? "border-mint bg-mint text-void"
                          : "border-line text-transparent hover:border-cyan"
                      )}
                    >
                      <Check size={13} strokeWidth={3} />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[12.5px] leading-snug font-semibold text-ice">{a.name}</p>
                        <button
                          onClick={() => setExpanded(open ? null : a.id)}
                          aria-expanded={open}
                          aria-label={`${open ? "Hide" : "Show"} details for ${a.name}`}
                          className="shrink-0 text-mute transition-colors hover:text-cyan"
                        >
                          <ChevronDown
                            size={15}
                            className={cn("transition-transform duration-200", open && "rotate-180")}
                          />
                        </button>
                      </div>
                      <p className="mt-0.5 text-[10.5px] tracking-wide text-mute">
                        <span style={{ color: LEVEL_COLOR[a.level] }}>{a.level}</span> ·{" "}
                        {FORMAT_LABEL[a.format]} · {a.proposedCadence.replace("Proposed: ", "")}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {a.domains.map((d) => (
                          <span
                            key={d}
                            className="size-2 rounded-full"
                            title={DOMAIN_MAP[d].name}
                            style={{
                              background: DOMAIN_MAP[d].color,
                              boxShadow: on ? `0 0 8px ${DOMAIN_MAP[d].color}` : "none",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <motion.div
                    initial={false}
                    animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-line/70 px-2.5 py-2.5">
                      <p className="text-[11.5px] leading-relaxed text-mute">{a.description}</p>
                      <DataLabel className="mt-3">Learning objectives</DataLabel>
                      <ul className="mt-1.5 space-y-1">
                        {a.learningObjectives.map((o) => (
                          <li key={o} className="flex gap-2 text-[11.5px] leading-relaxed text-ice/85">
                            <span className="mt-1.5 size-1 shrink-0 bg-cyan/70" />
                            {o}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {a.domains.map((d) => (
                          <button
                            key={d}
                            onClick={() => setActiveDomain(d)}
                            className="border border-line px-1.5 py-0.5 text-[10px] text-mute transition-colors hover:border-cyan/50 hover:text-cyan"
                          >
                            {DOMAIN_MAP[d].name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {/* --------------------------------------------------------- summary */}
      <Panel kicker="Summary" title="Selected plan" accent="#a06bff">
        {selected.length === 0 ? (
          <EmptyState
            icon={<SlidersHorizontal size={22} />}
            title="No activities selected"
            hint="Pick proposals above to build a plan. The score, coverage and suggestions all update from your selection."
          />
        ) : (
          <>
            <ul className="space-y-1.5">
              {selected.map((id, i) => {
                const a = ACTIVITIES.find((x) => x.id === id);
                if (!a) return null;
                return (
                  <motion.li
                    key={id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-2 border border-line/80 bg-hull/50 p-2"
                  >
                    <span className="font-display text-[10px] text-mute">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] text-ice">{a.name}</span>
                      <span className="block text-[10px]" style={{ color: LEVEL_COLOR[a.level] }}>
                        {a.level} · {FORMAT_LABEL[a.format]}
                      </span>
                    </span>
                    <button
                      onClick={() => toggleActivity(id)}
                      aria-label={`Remove ${a.name} from the plan`}
                      className="shrink-0 p-1 text-mute transition-colors hover:text-rose-300"
                    >
                      <X size={13} />
                    </button>
                  </motion.li>
                );
              })}
            </ul>
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line/70 pt-3">
              {score.coveredDomains.map((d) => (
                <span
                  key={d}
                  className="border px-1.5 py-0.5 text-[10px]"
                  style={{
                    color: DOMAIN_MAP[d].color,
                    borderColor: `${DOMAIN_MAP[d].color}44`,
                    background: `${DOMAIN_MAP[d].color}10`,
                  }}
                >
                  {DOMAIN_MAP[d].name}
                </span>
              ))}
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
