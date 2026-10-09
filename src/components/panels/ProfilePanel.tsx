import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Camera, CircleCheck, CircleSlash, Image as ImageIcon } from "lucide-react";
import { MODULE_ICONS } from "@/components/ui/icons";
import { Btn, DataLabel, Panel, Reveal } from "@/components/ui/primitives";
import { BrandMark } from "@/components/Nav";
import { PORTRAIT_PATH_HINT, PORTRAIT_SRC } from "@/lib/env";
import { useClubStore } from "@/store/useClubStore";
import type { ModuleId } from "@/types";

/**
 * Replaceable candidate portrait.
 * Drop a square image at `public/portrait.jpg` (or set PORTRAIT_SRC in
 * src/lib/env.ts) and it is used automatically. No placeholder portrait of a
 * real-looking person is generated — the fallback is a neutral monogram frame.
 */
export function Portrait({ size = 132 }: { size?: number }) {
  const [failed, setFailed] = useState(false);
  const src = PORTRAIT_SRC ?? "/portrait.jpg";

  return (
    <div
      className="sweep relative shrink-0 overflow-hidden border border-cyan/30 bg-hull"
      style={{ width: size, height: size }}
    >
      {!failed ? (
        <img
          src={src}
          alt="Portrait of Vinayak Katiyar"
          width={size}
          height={size}
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_50%_35%,rgba(44,232,255,0.18),transparent_70%)]">
          <div className="text-center">
            <BrandMark size={Math.round(size * 0.42)} />
            <p className="mt-1.5 flex items-center justify-center gap-1 font-display text-[8px] tracking-[0.16em] text-mute/70 uppercase">
              <ImageIcon size={9} /> portrait slot
            </p>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 scanlines opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-cyan/60" />
    </div>
  );
}

const LAUNCHERS: Array<{ id: ModuleId; title: string; caption: string; color: string }> = [
  {
    id: "globe",
    title: "Innovation Globe",
    caption: "Explore six technology domains in 3D",
    color: "#35e6ff",
  },
  {
    id: "circuit",
    title: "Vision Circuit",
    caption: "Walk the proposed four-stage roadmap",
    color: "#a06bff",
  },
  {
    id: "simulator",
    title: "Build Your Club",
    caption: "Compose an activity plan and score its coverage",
    color: "#46f0b0",
  },
];

export function ProfilePanel() {
  const setModule = useClubStore((s) => s.setModule);
  const setView2D = useClubStore((s) => s.setView2D);
  const view2D = useClubStore((s) => s.view2D);

  return (
    <div className="space-y-3">
      <Panel kicker="Module 01 — Candidate" title="Vinayak Katiyar" accent="#2ce8ff">
        <div className="flex gap-4">
          <Portrait />
          <div className="min-w-0 flex-1">
            <DataLabel>Candidate for President</DataLabel>
            <p className="mt-1 font-display text-[13px] leading-tight font-bold tracking-[0.12em] text-ice uppercase">
              Advance
              <br />
              Tech Club
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="pulse-ring size-1.5 bg-cyan blink" />
              <span className="font-display text-[9.5px] tracking-[0.22em] text-cyan uppercase">
                Campaign lab online
              </span>
            </div>
          </div>
        </div>

        <motion.blockquote
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-5 border-l-2 border-cyan pl-3"
        >
          <p className="font-display text-[15px] leading-snug font-bold tracking-wide text-ice sm:text-[17px]">
            “Learn. Build. Innovate. Together.”
          </p>
        </motion.blockquote>

        <p className="mt-4 text-[13px] leading-relaxed text-mute">
          “My vision is to help create a club where students turn curiosity into practical skills,
          build meaningful projects, and grow through collaboration.”
        </p>
      </Panel>

      <Panel kicker="Enter the lab" title="Three interactive modules" accent="#46f0b0">
        <div className="space-y-1.5">
          {LAUNCHERS.map((l, i) => {
            const Icon = MODULE_ICONS[l.id];
            return (
              <Reveal key={l.id} delay={i * 0.06}>
                <button
                  onClick={() => setModule(l.id)}
                  className="group flex w-full items-center gap-3 border border-line/80 bg-hull/50 p-2.5 text-left transition-all duration-200 hover:bg-panel"
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${l.color}88`)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
                >
                  <span
                    className="grid size-9 shrink-0 place-items-center border"
                    style={{ color: l.color, borderColor: `${l.color}44`, background: `${l.color}10` }}
                  >
                    <Icon size={17} strokeWidth={1.7} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-ice">
                      {l.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-mute">{l.caption}</span>
                  </span>
                  <ArrowRight
                    size={15}
                    className="shrink-0 text-mute/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-cyan"
                  />
                </button>
              </Reveal>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 border-t border-line/70 pt-3">
          <Btn size="sm" variant="outline" onClick={() => setModule("ideas")}>
            Open idea console
          </Btn>
          <Btn size="sm" variant="ghost" onClick={() => setView2D(!view2D)}>
            {view2D ? "Return to 3D" : "Use 2D interface"}
          </Btn>
        </div>
      </Panel>

      <Panel kicker="Honesty check" title="What this site is — and is not" accent="#ffc46b">
        <ul className="space-y-2 text-[11.5px] leading-relaxed">
          {[
            "Every workshop, project and calendar entry shown here is a proposal for the club to debate and approve.",
            "No votes, polls, attendance numbers or popularity figures are simulated — nothing on this page invents student data.",
            "No qualifications, awards, endorsements or past achievements are claimed for the candidate.",
            "The idea console writes to this browser only; it does not send anything to the candidate or to other students.",
          ].map((t) => (
            <li key={t} className="flex gap-2 text-mute">
              <CircleCheck size={13} className="mt-0.5 shrink-0 text-mint" />
              {t}
            </li>
          ))}
          <li className="flex gap-2 text-mute">
            <CircleSlash size={13} className="mt-0.5 shrink-0 text-amber" />
            The planning score measures coverage of a proposal, never real-world success.
          </li>
        </ul>
      </Panel>

      <Panel kicker="Setup" title="Replacing the portrait" icon={<Camera size={15} />} accent="#2f9bff">
        <ol className="space-y-1.5 text-[11.5px] leading-relaxed text-mute">
          <li>
            <span className="font-display text-cyan">1.</span> Drop a square photo at{" "}
            <code className="px-1 text-ice">{PORTRAIT_PATH_HINT}</code>.
          </li>
          <li>
            <span className="font-display text-cyan">2.</span> Or set{" "}
            <code className="px-1 text-ice">PORTRAIT_SRC</code> in{" "}
            <code className="px-1 text-ice">src/lib/env.ts</code> to any URL.
          </li>
          <li>
            <span className="font-display text-cyan">3.</span> Until then the slot shows a neutral
            monogram — never a fabricated photo.
          </li>
        </ol>
      </Panel>
    </div>
  );
}
