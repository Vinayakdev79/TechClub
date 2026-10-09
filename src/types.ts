/**
 * Shared, typed data models for the Advance Tech Club campaign lab.
 * Everything here is plain data — the 3D scene and the 2D interface both read
 * from the same source so the two views can never drift apart.
 */

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type DomainId = "ai" | "robotics" | "iot" | "web" | "embedded" | "security";

export type ActivityFormat =
  | "workshop"
  | "competition"
  | "demo"
  | "showcase"
  | "talk"
  | "peer";

export type ModuleId = "profile" | "globe" | "circuit" | "simulator" | "ideas";

export type LevelFilter = "all" | Difficulty;

export interface Domain {
  id: DomainId;
  name: string;
  /** One-line summary used in 3D labels and chips. */
  short: string;
  explanation: string;
  beginnerProject: {
    title: string;
    summary: string;
    outcome: string;
  };
  skills: string[];
  workshop: {
    title: string;
    format: string;
    duration: string;
    outcome: string;
  };
  difficulty: Difficulty;
  /** Hex colour shared by the 3D node, the 2D card and the charts. */
  color: string;
  /** Latitude / longitude in degrees — converted to a 3D position on the globe. */
  coords: { lat: number; lon: number };
  /** Index into the icon registry (see components/ui/icons.tsx). */
  icon: DomainIconKey;
}

export type DomainIconKey =
  | "brain"
  | "robot"
  | "wifi"
  | "code"
  | "chip"
  | "shield";

export interface Activity {
  id: string;
  name: string;
  level: Difficulty;
  format: ActivityFormat;
  domains: DomainId[];
  description: string;
  learningObjectives: string[];
  /** Suggested cadence — a proposal, not a confirmed calendar entry. */
  proposedCadence: string;
}

export interface RoadmapStage {
  id: string;
  index: number;
  title: string;
  tagline: string;
  objective: string;
  actions: string[];
  /** ids of stages that must be at least started first (shown as lit traces). */
  dependencies: string[];
  deliverable: string;
  completionCriteria: string[];
  relatedDomains: DomainId[];
  /** Position on the circuit board (x, y, z). */
  position: [number, number, number];
  color: string;
}

export interface Idea {
  id: string;
  domain: DomainId | "general";
  activity: string;
  note: string;
  createdAt: number;
  updatedAt: number;
}

export type SortKey = "newest" | "oldest" | "domain";

export interface PlanScoreBreakdown {
  coverage: number;
  coverageMax: number;
  balance: number;
  balanceMax: number;
  formats: number;
  formatsMax: number;
  size: number;
  sizeMax: number;
  total: number;
  coveredDomains: DomainId[];
  missingDomains: DomainId[];
  levelCounts: Record<Difficulty, number>;
  formatCount: number;
}
