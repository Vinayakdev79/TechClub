import type { Activity } from "@/types";

/**
 * PROPOSED club activities for the "Build Your Club" simulator.
 * Every entry is a suggestion to be discussed and approved by club members —
 * none of these claim to be scheduled or previously delivered.
 */
export const ACTIVITIES: Activity[] = [
  {
    id: "workshops",
    name: "Hands-on Technical Workshops",
    level: "Beginner",
    format: "workshop",
    domains: ["web", "ai", "iot"],
    description:
      "Short, guided build sessions where every participant leaves with something running on their own machine. One concrete artefact per session, no passive lectures.",
    learningObjectives: [
      "Set up a working toolchain without help",
      "Complete one guided build end-to-end",
      "Read and interpret an error message independently",
      "Name the three core concepts behind the build",
    ],
    proposedCadence: "Proposed: twice a month, 2–3 hours",
  },
  {
    id: "hackathons",
    name: "Hackathons",
    level: "Intermediate",
    format: "competition",
    domains: ["ai", "web", "security", "iot"],
    description:
      "A timed team build with a public demo at the end. Judging criteria published in advance so teams optimise for working software, not slides.",
    learningObjectives: [
      "Scope a project to fit a hard deadline",
      "Split work inside a small team and integrate it again",
      "Use version control under pressure",
      "Present a technical result to a non-technical audience",
    ],
    proposedCadence: "Proposed: once per semester, 24–36 hours",
  },
  {
    id: "robot-demos",
    name: "Robotics Demonstrations",
    level: "Beginner",
    format: "demo",
    domains: ["robotics", "embedded"],
    description:
      "Live, physical demos in an open space — rovers, arms and drones that visitors can watch, question and, where safe, drive. The strongest recruiting tool a tech club has.",
    learningObjectives: [
      "Explain a control loop in plain language",
      "Diagnose a hardware failure in front of an audience",
      "Connect sensor input to observable behaviour",
      "Practice technical communication with visitors",
    ],
    proposedCadence: "Proposed: one open demo day per semester",
  },
  {
    id: "showcases",
    name: "Student Project Showcases",
    level: "Intermediate",
    format: "showcase",
    domains: ["web", "ai", "robotics", "iot", "embedded", "security"],
    description:
      "An exhibition where members present personal or team projects — including unfinished and failed ones. Normalising work-in-progress is how a club keeps beginners building.",
    learningObjectives: [
      "Write a short technical abstract for a project",
      "Defend a design decision with evidence",
      "Give structured feedback to another builder",
      "Reflect publicly on what did not work",
    ],
    proposedCadence: "Proposed: end of each term",
  },
  {
    id: "expert-talks",
    name: "Expert Talks",
    level: "Beginner",
    format: "talk",
    domains: ["ai", "security", "web"],
    description:
      "Invited practitioners describing real work: what the job actually looks like, what breaks in production, and how they learned. Always paired with a long Q&A and a written summary afterwards.",
    learningObjectives: [
      "Map a technology domain to real job roles",
      "Ask a specific, technical question",
      "Summarise a talk in writing for absent members",
      "Identify one skill to practise next",
    ],
    proposedCadence: "Proposed: monthly, 60–75 minutes",
  },
  {
    id: "peer-learning",
    name: "Peer-Learning Sessions",
    level: "Beginner",
    format: "peer",
    domains: ["web", "ai", "iot", "robotics"],
    description:
      "Member-led circles where a student teaches something they just learned. Teaching the week's topic is the fastest way to consolidate it — and it distributes leadership beyond the committee.",
    learningObjectives: [
      "Prepare a 15-minute technical explanation",
      "Answer questions you do not fully know (and find out)",
      "Adapt an explanation to mixed skill levels",
      "Build confidence presenting to peers",
    ],
    proposedCadence: "Proposed: weekly, 60 minutes, rotating host",
  },
  {
    id: "ctf-nights",
    name: "Capture-The-Flag Security Nights",
    level: "Advanced",
    format: "competition",
    domains: ["security", "web"],
    description:
      "Scored challenges on an isolated lab network with deliberately vulnerable targets. Strictly ethical scope, published rules, and a debrief on the most common weaknesses found.",
    learningObjectives: [
      "Work inside a defined legal and ethical scope",
      "Use Linux tooling and packet inspection",
      "Reason about authentication and session flaws",
      "Write a reproducible exploit report",
    ],
    proposedCadence: "Proposed: one evening per month",
  },
  {
    id: "iot-pilot",
    name: "Campus IoT Sensor Pilot",
    level: "Intermediate",
    format: "workshop",
    domains: ["iot", "embedded", "web"],
    description:
      "A long-running group build: instrument a club space with environmental sensors, publish the telemetry and maintain a public dashboard. Real deployment, real maintenance burden.",
    learningObjectives: [
      "Design a sensor node within a power budget",
      "Model telemetry as a stable data contract",
      "Operate and monitor a deployed system",
      "Document hardware so the next cohort can continue",
    ],
    proposedCadence: "Proposed: rolling project across the year",
  },
  {
    id: "research-circle",
    name: "Paper & Research Reading Circle",
    level: "Advanced",
    format: "peer",
    domains: ["ai", "security"],
    description:
      "A small group reads one technical paper per fortnight, reproduces its central figure, and presents the result. Builds the habit of reading primary sources instead of summaries.",
    learningObjectives: [
      "Read a research paper and extract its claim",
      "Reproduce a result from a methods section",
      "Critique experimental setup and evaluation",
      "Present findings to a technical audience",
    ],
    proposedCadence: "Proposed: fortnightly, 90 minutes",
  },
  {
    id: "oss-sprint",
    name: "Open-Source Contribution Sprint",
    level: "Advanced",
    format: "workshop",
    domains: ["web", "security", "ai"],
    description:
      "A guided sprint on real public repositories: reading an unfamiliar codebase, opening an issue, and submitting a first pull request that a maintainer reviews.",
    learningObjectives: [
      "Navigate a large unfamiliar codebase",
      "Write a clear issue and reproduction case",
      "Follow a project's contribution guidelines",
      "Handle code review feedback professionally",
    ],
    proposedCadence: "Proposed: twice a year, weekend format",
  },
];

export const ACTIVITY_MAP: Record<string, Activity> = ACTIVITIES.reduce(
  (acc, a) => {
    acc[a.id] = a;
    return acc;
  },
  {} as Record<string, Activity>
);

export const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export const FORMAT_LABEL: Record<Activity["format"], string> = {
  workshop: "Workshop",
  competition: "Competition",
  demo: "Live demo",
  showcase: "Showcase",
  talk: "Talk",
  peer: "Peer-led",
};
