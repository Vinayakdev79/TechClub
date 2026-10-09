import type { Domain, DomainId } from "@/types";

/**
 * The six technology domains of the Innovation Globe.
 *
 * IMPORTANT: every project / workshop below is a PROPOSAL for the club to vote
 * on. Nothing here claims to already exist or to have been delivered.
 */
export const DOMAINS: Domain[] = [
  {
    id: "ai",
    name: "Artificial Intelligence",
    short: "Models, data & evaluation",
    explanation:
      "How machines learn patterns from data instead of following hand-written rules. The club focus would be practical literacy: framing a problem, preparing a small dataset, training or fine-tuning a model, and — most importantly — measuring whether it actually works.",
    beginnerProject: {
      title: "Campus Question Classifier",
      summary:
        "Proposed project: collect ~200 anonymised student questions about club life, label them into 4 categories, and train a simple text classifier.",
      outcome: "A working demo plus an honest accuracy report and confusion matrix.",
    },
    skills: [
      "Python fundamentals",
      "Data cleaning & labelling",
      "Scikit-learn / PyTorch basics",
      "Evaluation metrics",
      "Responsible AI & bias review",
    ],
    workshop: {
      title: "Proposed workshop — “From CSV to Model in 3 Hours”",
      format: "Hands-on, laptops required, pairs of two",
      duration: "3 hours (proposed)",
      outcome: "Each pair leaves with a trained model and a one-page evaluation sheet.",
    },
    difficulty: "Intermediate",
    color: "#35e6ff",
    coords: { lat: 34, lon: -38 },
    icon: "brain",
  },
  {
    id: "robotics",
    name: "Robotics",
    short: "Sensing, actuation & control",
    explanation:
      "The meeting point of mechanics, electronics and code: a robot reads the world through sensors, decides with a control loop, and changes the world with actuators. Robotics is the fastest way to make programming physically visible.",
    beginnerProject: {
      title: "Line-Following Rover",
      summary:
        "Proposed project: a two-motor chassis with an infrared reflectance array, running a proportional control loop written by the students themselves.",
      outcome: "A rover that completes a taped track, plus tuning notes on oscillation.",
    },
    skills: [
      "DC motors & motor drivers",
      "Sensor calibration",
      "PID / proportional control",
      "C++ on microcontrollers",
      "Mechanical assembly",
    ],
    workshop: {
      title: "Proposed workshop — “Build a Rover in One Afternoon”",
      format: "Kit-based team build, 3 students per kit",
      duration: "4 hours (proposed)",
      outcome: "Each team races its rover on a shared track and logs one failure mode.",
    },
    difficulty: "Beginner",
    color: "#7c8cff",
    coords: { lat: -18, lon: 42 },
    icon: "robot",
  },
  {
    id: "iot",
    name: "Internet of Things",
    short: "Sensors, networks & telemetry",
    explanation:
      "Connecting physical measurements to software over a network. IoT teaches the whole chain — sensor, protocol, broker, storage, dashboard — and makes abstract networking concepts concrete because a failing link has a visible symptom.",
    beginnerProject: {
      title: "Lab Environment Monitor",
      summary:
        "Proposed project: a Wi-Fi microcontroller publishing temperature, humidity and occupancy to an MQTT topic, visualised on a shared live graph.",
      outcome: "A 7-day dataset and a discussion of sampling rate vs. battery cost.",
    },
    skills: [
      "ESP32 / microcontroller basics",
      "MQTT & HTTP",
      "JSON payloads",
      "Simple dashboards",
      "Power budgeting",
    ],
    workshop: {
      title: "Proposed workshop — “Sensor to Dashboard”",
      format: "Guided build with a pre-provisioned MQTT broker",
      duration: "2.5 hours (proposed)",
      outcome: "Every participant sees their own sensor data appear on the shared screen.",
    },
    difficulty: "Beginner",
    color: "#46f0b0",
    coords: { lat: 8, lon: 96 },
    icon: "wifi",
  },
  {
    id: "web",
    name: "Web Development",
    short: "Interfaces, APIs & deployment",
    explanation:
      "The lowest-friction way to ship something other people can actually use. The proposed track covers semantic markup, component thinking, state management, accessibility and deployment — with performance and a11y treated as requirements, not extras.",
    beginnerProject: {
      title: "Club Activity Board",
      summary:
        "Proposed project: a responsive single-page app where members can browse proposed events, filter by domain and save favourites to local storage.",
      outcome: "A deployed URL, a Lighthouse report and an accessibility checklist.",
    },
    skills: [
      "HTML & CSS layout",
      "JavaScript / TypeScript",
      "React components & state",
      "REST APIs",
      "Accessibility & performance",
    ],
    workshop: {
      title: "Proposed workshop — “Ship a Page Before Dinner”",
      format: "Live-coding session with a deploy at the end",
      duration: "3 hours (proposed)",
      outcome: "Each student publishes their own live URL during the session.",
    },
    difficulty: "Beginner",
    color: "#2f9bff",
    coords: { lat: 46, lon: 148 },
    icon: "code",
  },
  {
    id: "embedded",
    name: "Hardware & Embedded Systems",
    short: "Bare metal, signals & boards",
    explanation:
      "Writing software close to the silicon: registers, interrupts, timing and real electrical constraints. Embedded work teaches precision because a bug here is measured in microseconds and milliamps, not in stack traces.",
    beginnerProject: {
      title: "Interrupt-Driven Reaction Timer",
      summary:
        "Proposed project: an LED/button game on a microcontroller using hardware interrupts and a timer, with measured human reaction times displayed on a small screen.",
      outcome: "Working firmware plus a written explanation of the interrupt service routine.",
    },
    skills: [
      "C for microcontrollers",
      "GPIO & interrupts",
      "Timers & PWM",
      "Reading a datasheet",
      "Serial debugging",
    ],
    workshop: {
      title: "Proposed workshop — “Blink to Interrupt”",
      format: "Bench session, boards and logic analysers provided",
      duration: "3 hours (proposed)",
      outcome: "Participants replace a polling loop with an interrupt and measure the gain.",
    },
    difficulty: "Advanced",
    color: "#ffc46b",
    coords: { lat: -34, lon: -120 },
    icon: "chip",
  },
  {
    id: "security",
    name: "Cybersecurity",
    short: "Threats, defence & ethics",
    explanation:
      "Understanding how systems are attacked is the fastest route to building them properly. The proposed track stays strictly ethical: all exercises run on isolated lab machines or deliberately vulnerable targets that students are allowed to test.",
    beginnerProject: {
      title: "Password Strength Lab",
      summary:
        "Proposed project: an offline lab that hashes sample passwords with different algorithms and measures how long brute force takes, ending in a written security recommendation.",
      outcome: "A report explaining salting, hashing cost and realistic password policy.",
    },
    skills: [
      "Linux command line",
      "Networking fundamentals",
      "Cryptography basics",
      "Threat modelling",
      "Ethics & responsible disclosure",
    ],
    workshop: {
      title: "Proposed workshop — “Capture The Flag: Night One”",
      format: "Isolated lab environment, individual + team challenges",
      duration: "3 hours (proposed)",
      outcome: "Scored CTF with a debrief on which weaknesses were most common.",
    },
    difficulty: "Intermediate",
    color: "#a06bff",
    coords: { lat: -8, lon: -22 },
    icon: "shield",
  },
];

export const DOMAIN_MAP: Record<DomainId, Domain> = DOMAINS.reduce(
  (acc, d) => {
    acc[d.id] = d;
    return acc;
  },
  {} as Record<DomainId, Domain>
);

/** Convert lat/lon (degrees) to a point on a sphere of the given radius. */
export function domainPosition(
  domain: Domain,
  radius: number
): [number, number, number] {
  const phi = (90 - domain.coords.lat) * (Math.PI / 180);
  const theta = (domain.coords.lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
}

export function domainById(id: DomainId | null | undefined): Domain | null {
  if (!id) return null;
  return DOMAIN_MAP[id] ?? null;
}
