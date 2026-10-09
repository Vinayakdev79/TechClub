import { ACTIVITIES, ACTIVITY_MAP } from "@/data/activities";
import { DOMAINS } from "@/data/domains";
import type { Difficulty, PlanScoreBreakdown } from "@/types";

export const SCORE_RULES = {
  coverageMax: 40,
  balanceMax: 25,
  formatsMax: 20,
  sizeMax: 15,
  /** Number of activities at which the "plan size" component is fully earned. */
  sizeFullAt: 5,
  totalFormats: 6,
} as const;

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Deterministic planning score for a selected activity plan.
 *
 * It measures COVERAGE AND DIVERSITY of the proposal — it is explicitly not a
 * prediction of real-world success, attendance or campaign support.
 *
 * Components (documented in the UI, same wording):
 *
 * 1. Domain coverage — 40 pts
 *    (unique technology domains touched by the selection ÷ 6) × 40
 *
 * 2. Level balance — 25 pts
 *    Let b/i/a be the number of selected Beginner / Intermediate / Advanced
 *    activities and n = b + i + a.
 *    balance = (1 − (max(b,i,a) − min(b,i,a)) ÷ n) × 25   → 0 when n = 0
 *    A plan made of only one difficulty level scores 0 here.
 *
 * 3. Format variety — 20 pts
 *    (unique activity formats ÷ 6) × 20  — workshop, competition, demo,
 *    showcase, talk and peer-led are the six formats on offer.
 *
 * 4. Plan size — 15 pts
 *    min(n ÷ 5, 1) × 15 — full marks at five or more activities.
 *
 * Total = round(sum), clamped to 0–100.
 */
export function scorePlan(selectedIds: string[]): PlanScoreBreakdown {
  const activities = selectedIds
    .map((id) => ACTIVITY_MAP[id])
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  const totalDomains = DOMAINS.length;
  const covered = new Set(activities.flatMap((a) => a.domains));
  const coverage = (covered.size / totalDomains) * SCORE_RULES.coverageMax;

  const levelCounts: Record<Difficulty, number> = {
    Beginner: 0,
    Intermediate: 0,
    Advanced: 0,
  };
  activities.forEach((a) => {
    levelCounts[a.level] += 1;
  });
  const n = activities.length;
  const counts = Object.values(levelCounts);
  const spread = n === 0 ? 0 : (Math.max(...counts) - Math.min(...counts)) / n;
  const balance = (1 - spread) * SCORE_RULES.balanceMax;

  const formats = new Set(activities.map((a) => a.format));
  const formatScore =
    (formats.size / SCORE_RULES.totalFormats) * SCORE_RULES.formatsMax;

  const size = Math.min(n / SCORE_RULES.sizeFullAt, 1) * SCORE_RULES.sizeMax;

  const total = Math.max(
    0,
    Math.min(100, Math.round(coverage + balance + formatScore + size))
  );

  return {
    coverage: round2(coverage),
    coverageMax: SCORE_RULES.coverageMax,
    balance: round2(balance),
    balanceMax: SCORE_RULES.balanceMax,
    formats: round2(formatScore),
    formatsMax: SCORE_RULES.formatsMax,
    size: round2(size),
    sizeMax: SCORE_RULES.sizeMax,
    total,
    coveredDomains: DOMAINS.filter((d) => covered.has(d.id)).map((d) => d.id),
    missingDomains: DOMAINS.filter((d) => !covered.has(d.id)).map((d) => d.id),
    levelCounts,
    formatCount: formats.size,
  };
}

export function scoreVerdict(total: number): { label: string; hint: string } {
  if (total === 0)
    return {
      label: "Empty plan",
      hint: "Select at least one proposed activity to start building a plan.",
    };
  if (total < 30)
    return {
      label: "Narrow",
      hint: "The plan leans on one format or one difficulty level. Add a contrasting activity.",
    };
  if (total < 55)
    return {
      label: "Developing",
      hint: "Some domains are covered. Check which technology areas are still missing.",
    };
  if (total < 78)
    return {
      label: "Balanced",
      hint: "Good spread across levels and formats. A couple of domains are still untouched.",
    };
  return {
    label: "Wide coverage",
    hint: "This proposal touches every domain and mixes formats and difficulty levels.",
  };
}

/** Suggestions that would raise the score, computed from the same rules. */
export function suggestNext(selectedIds: string[]): string[] {
  const score = scorePlan(selectedIds);
  const suggestions: string[] = [];

  if (score.missingDomains.length > 0) {
    const uncovered = score.missingDomains;
    const candidate = ACTIVITIES.find((a) =>
      a.domains.some((d) => uncovered.includes(d))
    );
    if (candidate && !selectedIds.includes(candidate.id)) {
      suggestions.push(
        `“${candidate.name}” would extend coverage to untouched domains.`
      );
    }
  }

  const levels = Object.entries(score.levelCounts) as Array<
    [Difficulty, number]
  >;
  const empty = levels.filter(([, c]) => c === 0).map(([l]) => l);
  if (empty.length > 0) {
    const candidate = ACTIVITIES.find(
      (a) => empty.includes(a.level) && !selectedIds.includes(a.id)
    );
    if (candidate) {
      suggestions.push(
        `No ${empty.join(" / ")} activity yet — “${candidate.name}” would balance the levels.`
      );
    }
  }

  if (score.formatCount < SCORE_RULES.totalFormats) {
    const used = new Set(
      selectedIds.map((id) => ACTIVITY_MAP[id]?.format).filter(Boolean)
    );
    const candidate = ACTIVITIES.find(
      (a) => !used.has(a.format) && !selectedIds.includes(a.id)
    );
    if (candidate) {
      suggestions.push(
        `Format variety is ${score.formatCount}/6 — “${candidate.name}” adds a new format.`
      );
    }
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "Coverage is maximal under these rules. Refine the plan instead of growing it."
    );
  }
  return suggestions;
}
