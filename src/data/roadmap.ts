import type { RoadmapStage } from "@/types";

/**
 * The Vision Circuit — a PROPOSED four-stage roadmap for the presidential term.
 *
 * It is a plan to be approved by the club, not a commitment that has already
 * started. Stages may be explored in any order.
 */
export const ROADMAP: RoadmapStage[] = [
  {
    id: "listen",
    index: 1,
    title: "Listen & Connect",
    tagline: "Collect student suggestions and identify priorities",
    objective:
      "Find out what members actually want before proposing anything. The output of this stage is a ranked, evidence-based list of priorities rather than a committee's guess.",
    actions: [
      "Open a short suggestion form to every club member (the console on this site is a local demo of that idea)",
      "Run two open listening sessions — one in person, one online — at different times of day",
      "Talk to each technology domain lead informally and record what they say is missing",
      "Group the collected suggestions into themes and count how often each theme appears",
      "Publish the raw, anonymised summary so members can check it is accurate",
    ],
    dependencies: [],
    deliverable:
      "A one-page “Member Priorities” summary: top themes, how many mentions each received, and what was deliberately left out.",
    completionCriteria: [
      "At least one suggestion collected from every technology domain",
      "Themes published back to members for correction",
      "A named owner for each priority theme",
    ],
    relatedDomains: ["web", "ai", "security"],
    position: [-4.2, 0, 1.4],
    color: "#35e6ff",
  },
  {
    id: "plan",
    index: 2,
    title: "Plan & Organise",
    tagline: "Propose an activity calendar and form project teams",
    objective:
      "Turn the priorities from Stage 1 into a realistic calendar and a set of self-organising teams, with named owners and honest resource estimates.",
    actions: [
      "Draft a term calendar using the top three priorities from Stage 1",
      "Estimate cost, room, equipment and volunteer hours for each proposed activity",
      "Open team sign-ups so members choose projects instead of being assigned",
      "Agree a simple definition of done for each team's first milestone",
      "Present the draft calendar to the club for approval and edit it with the feedback",
    ],
    dependencies: ["listen"],
    deliverable:
      "An approved draft activity calendar plus a team roster with a named lead per project.",
    completionCriteria: [
      "Calendar approved by the club committee and members",
      "Every proposed activity has an owner and a resource estimate",
      "No activity is scheduled without a room/equipment confirmation",
    ],
    relatedDomains: ["web", "iot", "robotics"],
    position: [-1.4, 0, -1.2],
    color: "#2f9bff",
  },
  {
    id: "build",
    index: 3,
    title: "Build & Launch",
    tagline: "Start an initial workshop or collaborative project",
    objective:
      "Ship one real, small thing early. A single successful first activity teaches the committee more than a semester of planning and gives new members an immediate reason to stay.",
    actions: [
      "Pick the lowest-risk, highest-interest activity from the approved calendar",
      "Prepare materials, machines and a fallback plan for technical failure",
      "Run the activity with a helper ratio of at least one per eight participants",
      "Record what broke, what ran late and what participants asked most often",
      "Publish photos, code and notes so absent members can follow along",
    ],
    dependencies: ["plan"],
    deliverable:
      "One delivered workshop or project kickoff, plus a public write-up including what went wrong.",
    completionCriteria: [
      "Activity delivered with participants completing the intended artefact",
      "Written retrospective published within one week",
      "At least three participants express interest in the next session",
    ],
    relatedDomains: ["ai", "robotics", "embedded", "web"],
    position: [1.4, 0, 1.2],
    color: "#46f0b0",
  },
  {
    id: "review",
    index: 4,
    title: "Review & Improve",
    tagline: "Collect feedback and refine upcoming activities",
    objective:
      "Close the loop. Feedback is only useful if the next calendar visibly changes because of it — and if members can see that it changed.",
    actions: [
      "Send a three-question feedback form within 48 hours of each activity",
      "Compare attendance and completion against the Stage 2 estimates",
      "Hold a 30-minute review with activity owners, no slides allowed",
      "Rewrite the next activity's plan using the specific criticisms received",
      "Report the changes back to members: “you said X, we changed Y”",
    ],
    dependencies: ["build", "plan"],
    deliverable:
      "A revision log listing every change made to the plan and the feedback that caused it.",
    completionCriteria: [
      "Feedback collected from a majority of participants for each activity",
      "At least one concrete change traced back to member feedback",
      "Revision log shared with the whole club",
    ],
    relatedDomains: ["ai", "web", "security", "iot"],
    position: [4.2, 0, -1.4],
    color: "#a06bff",
  },
];

export const STAGE_MAP: Record<string, RoadmapStage> = ROADMAP.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<string, RoadmapStage>
);

/** Ordered pairs used to draw the copper traces on the board. */
export const TRACES: Array<{ from: string; to: string }> = ROADMAP.flatMap(
  (stage) => stage.dependencies.map((dep) => ({ from: dep, to: stage.id }))
);

export const ROADMAP_DISCLAIMER =
  "Proposed roadmap. Nothing here is committed — every stage depends on club approval, room availability, budget and volunteer time.";
