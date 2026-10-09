# Advance Tech Club — Interactive 3D Presidential Campaign

**Candidate:** Vinayak Katiyar · **Role sought:** President, Advance Tech Club
**Headline:** “Learn. Build. Innovate. Together.”

An immersive, production-quality campaign **lab** built with React, TypeScript, Three.js,
React Three Fiber, Drei, Tailwind CSS v4, Framer Motion and Zustand. It is not a landing page
with decorative 3D: every 3D object is wired to real application state, a user decision or an
educational outcome.

> **Honesty policy baked into the content:** every workshop, project, calendar entry and roadmap
> stage is labelled a **proposal**. No votes, polls, attendance figures, popularity metrics,
> qualifications, awards or endorsements are invented anywhere in the app. The planning score
> measures *coverage of a proposal*, never real-world success. The idea console writes to the
> visitor's own browser only.

---

## 1. Install & run

```bash
npm install        # install dependencies
npm run dev        # start Vite dev server (http://localhost:5173)
npm run build      # production build → dist/
npm run preview    # preview the production build locally
```

Node 18+ / 20+ recommended.

### Stack versions (pinned for stability)

| Package | Version |
| --- | --- |
| react / react-dom | 19.2.x |
| three | 0.181.x |
| @react-three/fiber | 9.3.x |
| @react-three/drei | 10.7.x |
| @react-three/postprocessing | 3.0.x |
| framer-motion | 12.x |
| zustand | 5.x |
| tailwindcss | 4.1.x (via `@tailwindcss/vite`) |
| lucide-react | 0.545.x |
| vite | 7.3.x |

---

## 2. Project structure

```
index.html                     Fonts (Space Grotesk + Orbitron), meta, title
src/
  main.tsx                     React root
  index.css                    Tailwind v4 @theme tokens, holographic HUD chrome, keyframes
  types.ts                     Typed data models (Domain, Activity, RoadmapStage, Idea, …)
  App.tsx                      Shell: stage, HUD, dock, overlays, shortcuts, guards
  data/
    domains.ts                 6 technology domains + lat/lon → 3D projection helper
    activities.ts              10 proposed activities (level, format, domains, objectives)
    roadmap.ts                 4 proposed roadmap stages + dependency traces + disclaimer
  lib/
    scoring.ts                 Deterministic plan score, verdicts, rule-based suggestions
    env.ts                     WebGL probe, capability tiers, localStorage helpers, portrait slot
  store/
    useClubStore.ts            Single Zustand store (persisted slice) shared by 3D + DOM
  components/
    Nav.tsx                    Persistent top nav, brand mark, utility toggles, status bar
    Stage2D.tsx                Full accessible 2D alternative for all three 3D scenes
    ui/primitives.tsx          Panel, Btn, Chip, Meter, ScoreRing, Reveal, EmptyState, ProposalTag
    ui/icons.tsx               Static Lucide icon registries (domains + modules)
    panels/
      ProfilePanel.tsx         Candidate profile + replaceable Portrait component
      GlobePanel.tsx           Domain list & proposal pack, related activities → plan
      CircuitPanel.tsx         Roadmap stages, dependencies, deliverables, criteria
      SimulatorPanel.tsx       Activity selector, filters, score breakdown, summary
      IdeasPanel.tsx           Validated idea form, local CRUD, filtering, sorting
    scene/
      SceneRoot.tsx            <Canvas>, lighting, fog, DPR tiers, error boundary, OrbitControls
      CameraRig.tsx            Deterministic camera flights + user-drag cancellation
      ControlRoom.tsx          Hub: core, platform, three state-reactive module pylons
      InnovationGlobe.tsx      Wireframe globe, dot cloud, arcs, 6 interactive nodes
      VisionCircuit.tsx        PCB board, copper traces, pulses, 4 stage chips
      SceneEffects.tsx         Lazy bloom + vignette (skipped on lite / reduced motion)
      shared.tsx               Glow sprite texture, starfield, hover cursor, easing, frameloop
```

Separation is strict: `data/` and `lib/` are pure and framework-free; `scene/` only reads and
writes the store; `panels/` never imports Three.js.

---

## 3. Replacing the candidate portrait

No photograph of a real-looking person is generated or shipped. The slot falls back to a neutral
monogram frame.

1. Drop a **square** image at `public/portrait.jpg` (JPG/PNG/WebP, ~600×600 px or larger).
   It is picked up automatically by `src/components/panels/ProfilePanel.tsx → <Portrait />`.
2. **Or** point at any URL/asset by editing `src/lib/env.ts`:
   ```ts
   export const PORTRAIT_SRC: string | null = "/images/vinayak.webp";
   ```
3. The `onError` handler keeps the monogram placeholder if the file is missing, so the layout
   never breaks.

---

## 4. Deployment

### Vercel
```bash
npm i -g vercel
vercel            # framework preset: Vite · build: npm run build · output: dist
```
`vercel.json` is not required. For the preview/production URL set nothing else — all state is
client-side.

### Netlify
```bash
npm i -g netlify-cli
netlify deploy --build --prod
```
or `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Notes:
* The repo builds through `vite-plugin-singlefile`, so `dist/index.html` is fully self-contained
  (JS + CSS inlined). Any static host works.
* Fonts load from Google Fonts; the layout degrades gracefully to system sans if blocked.
* No environment variables are required. No secret may ever be added to frontend code — a future
  backend must keep credentials server-side (see §8).

---

## 5. Implemented interactions and their logic

### Campaign Control Room (`scene/ControlRoom.tsx`)
| Interaction | Logic / observable effect |
| --- | --- |
| Click a module pylon | `setModule(id)` → scene switches, camera flies to hub framing, dock panel changes, top-nav active tab moves (single source of truth) |
| Globe pylon | Tints to `activeDomainId` colour; core colour follows the selected domain |
| Circuit pylon | Raises an octahedron marker when a roadmap stage is selected |
| Simulator pylon | Four bars whose heights/emissive follow `selectedActivities.length` |
| Core ↔ pylon traces | Solid + coloured when that module is active, dashed + dim otherwise |
| Hover any pylon | Scale lerp, ring brightens, cursor becomes a pointer |

### Innovation Globe (`scene/InnovationGlobe.tsx`)
| Interaction | Logic |
| --- | --- |
| Drag | OrbitControls rotation (touch: one-finger rotate, two-finger dolly) |
| Scroll / pinch | Zoom, clamped `minDistance 3.2 … maxDistance 17` |
| Click a node | `setActiveDomain(id)` → the globe group **rotates the node to the front** (`lerpAngle` to `-atan2(x,z)`) while the camera flies in; arcs touching that node brighten; dock opens the proposal pack |
| Click the same node again / empty space / `Esc` | Clears the selection, auto-rotation resumes, camera returns to the overview framing |
| Dock domain list | Identical selection path — fully keyboard operable |
| “Related learning activities → Add” | Toggles the activity in the simulator plan (cross-module state) |
| Related-domain chips in the roadmap panel | `setActiveDomain` → flies back to the globe |

### Vision Circuit (`scene/VisionCircuit.tsx`)
| Interaction | Logic |
| --- | --- |
| Click a stage chip | `setActiveStage(id)` → camera flies to `stage.position + offset`; the chip lifts, a ripple ring expands and a light column appears |
| Dependency illumination | Traces where `to === active` or `from === active` switch to the stage colour, thicken, and a pulse sphere travels the Catmull-Rom path (disabled under reduced motion) |
| Dependency stages | Their chips also lift (`isDependency`) |
| Related-domain markers | Small spheres around each pad light up with their domain colour when the related stage is active |
| SMD parts on the board | Emissive colour follows the domains of the active stage |
| No locking | All four stages are always clickable, in any order |
| Dock “Board view” | Clears the stage, camera returns to the top-down overview |

### Build Your Club simulator (`panels/SimulatorPanel.tsx` + `lib/scoring.ts`)
| Interaction | Logic |
| --- | --- |
| Toggle an activity | Adds/removes from `selectedActivities`; the 3D simulator pylon bars and the score update immediately |
| Level filter chips | Filters the catalogue (`all / Beginner / Intermediate / Advanced`); selection persists across filters |
| Chevron on a row | Expands description, learning objectives and clickable domain tags |
| Score ring + 4 meters | Live breakdown of the documented formula (see §6) |
| “What the rules suggest” | Deterministic suggestions derived from the same rules (missing domain, missing level, missing format) |
| Untouched-domain chips | Jump to that domain on the globe |
| Summary list | Reorder-free numbered list with per-item remove |
| Reset | Clears the plan (also persisted) |

### Student Idea Console (`panels/IdeasPanel.tsx`)
| Interaction | Logic |
| --- | --- |
| Domain chips | Sets `idea.domain` (six domains + General) |
| Validation | Activity required, 4–140 chars; note optional ≤ 400 chars; errors render inline with `role="alert"` and `aria-invalid`; validated on blur and on submit |
| Submit | `addIdea()` → new record with `createdAt`, prepended to the list, transient confirmation banner (3.2 s) |
| Edit | Loads the record into the form, switches the panel to “Edit your saved idea”, `updateIdea()` stamps `updatedAt` |
| Delete / Delete all | `removeIdea()` / `clearIdeas()` |
| Filter + sort | By domain (with live counts) and by newest / oldest / category |
| “open domain” on a card | Flies the camera to that domain on the globe |
| Persistence | Zustand `persist` → `localStorage["atc.campaign.v1"]`, wrapped in try/catch so private-mode browsers degrade to in-memory only |

### Global / shell
| Interaction | Logic |
| --- | --- |
| Top nav tabs | `setModule`, persisted active-tab underline via `layoutId` |
| `2D interface` toggle (`V`) | Swaps WebGL for `Stage2D`; auto-enabled when WebGL is missing or the scene throws; button is disabled (and labelled) when WebGL is unavailable |
| `Reduced motion` (`M`) | Initialised from `prefers-reduced-motion`; stops globe/circuit/core animation, camera flights snap instead of easing, disables bloom, disables CSS animations via `.reduced-motion` |
| Quality cycle (`Gauge`) | `high / balanced / lite` → DPR `[1,2] / [1,1.5] / [1,1]`, antialiasing on/off, starfield density, and bloom skipped entirely on `lite` |
| Panel toggle (`P`) | Collapses the dock so the 3D fills the screen; a re-open tab appears |
| Number keys `1–5` | Jump to Candidate / Globe / Circuit / Simulator / Ideas |
| `Esc` | Clears the 3D selection first, otherwise hides the dock; blurs focused inputs |
| Tab hidden | `visibilitychange` → `frameloop="never"`, zero GPU work |

### 2D fallback (`Stage2D.tsx`)
* **Globe** — orthographic SVG projection of the *same* `domainPosition()` data with depth dimming
  and a keyboard-operable rotation slider; nodes are real `<button>`s.
* **Circuit** — top-down SVG board with Manhattan traces that light up for the active stage and
  its dependencies, plus a card list of all four stages.
* **Control room** — three module tiles mirroring the pylons, with the same activation states.

---

## 6. Planning score — documented rules

```
total = coverage + balance + formats + size      (clamped 0…100, rounded)

coverage (40) = (unique domains touched ÷ 6) × 40
balance  (25) = (1 − (max(b,i,a) − min(b,i,a)) ÷ n) × 25        n = selected count, 0 if n = 0
formats  (20) = (unique formats ÷ 6) × 20      workshop|competition|demo|showcase|talk|peer
size     (15) = min(n ÷ 5, 1) × 15
```

Verdict bands: `0 Empty plan · <30 Narrow · <55 Developing · <78 Balanced · ≥78 Wide coverage`.
The formula has no random term, no weighting tuning per activity and no claim about real-world
outcomes; it is displayed verbatim inside the panel (`Meter` captions).

---

## 7. Unified state model (`store/useClubStore.ts`)

Ephemeral: `module`, `scene`, `activeDomainId`, `activeStageId`, `cameraNonce`, `editingIdeaId`,
`lastIdeaAction`, `webglAvailable`, `sceneStatus`, `navOpen`, `hydrated`.
Persisted: `ideas`, `selectedActivities`, `levelFilter`, `ideaDomainFilter`, `ideaSort`,
`reducedMotion`, `capability`, `view2D`.

`MODULE_SCENE` maps each module to the scene it drives (`profile/simulator/ideas → control`,
`globe → globe`, `circuit → circuit`), which is how the 3D and DOM views stay synchronised:
both render from the same fields, and both write through the same actions.

---

## 8. Performance

* `React.lazy` for `SceneRoot`, `Stage2D` and `SceneEffects` (post-processing is never evaluated
  on the `lite` tier or under reduced motion).
* Capability tiers cap `dpr`, disable antialiasing, reduce the starfield and skip bloom.
* Shared/memoised resources: one module-level glow `CanvasTexture`, one generated dot-cloud
  `BufferGeometry`, deterministic (non-`Math.random`) point distributions, primitive geometries
  only — no external model or texture downloads.
* Only the active scene is mounted at a time; `frameloop="never"` when the tab is hidden.
* Fine-grained Zustand selectors (single field each) keep re-renders local; `useFrame` reads
  refs instead of state.
* `SceneErrorBoundary` + `onCreated` + a 9 s boot guard: any WebGL failure degrades to the 2D
  interface instead of a blank page.

---

## 9. Connecting a real backend later

`IdeasPanel` only calls typed store actions. To go live:

1. Add a server route (Vercel/Netlify function) that validates and stores submissions.
2. Expose **only** a public base URL to the client: `VITE_API_URL` in `.env`.
3. Replace the bodies of `addIdea` / `updateIdea` / `removeIdea` with `fetch` calls, keeping the
   optimistic local write and adding an error state.
4. Re-validate every field server-side (the client rules in `lib` are UX, not security).
5. Never place API keys, DB URLs or tokens in `src/` — only server-side env vars.

---

## 10. Manual testing checklist

**Boot & fallback**
- [ ] App loads with the 3D control room; loader disappears; status bar reads `3D ONLINE`.
- [ ] With WebGL blocked (browser flag / `webglreport` fail) the amber banner appears and the 2D
      stage is fully usable; the `2D interface` toggle is disabled and labelled.
- [ ] Kill the scene (e.g. force an error) → error boundary switches to 2D, no blank screen.

**Globe**
- [ ] Drag rotates, wheel/pinch zooms within limits, panning is disabled.
- [ ] Each of the 6 nodes is clickable; the node rotates to the front and the camera flies in.
- [ ] Panel shows explanation, skills, proposed project, proposed workshop, difficulty.
- [ ] “Add” on a related activity updates the simulator count immediately.
- [ ] Clicking empty space or `Esc` clears the selection and resumes auto-rotation.

**Circuit**
- [ ] All 4 stages are clickable in any order; none is locked.
- [ ] Active stage lifts, ripples, shows a light column; its dependency traces brighten and pulse.
- [ ] Panel shows objective, action steps, dependencies (clickable), deliverable, completion
      criteria, related domains (clickable → globe).
- [ ] The proposal disclaimer is visible on both the board and the panel.

**Simulator**
- [ ] Filters show/hide activities; selections survive filter changes.
- [ ] Score, four meters, verdict, level counters and suggestions update on every toggle.
- [ ] Verify by hand: 1 Beginner workshop → coverage ≈ 3/6·40 = 20, balance 0, formats 3.33,
      size 3 → **26**.
- [ ] Add one activity per level and per format → score rises monotonically, caps at 100.
- [ ] Reset empties the plan and persists after reload.

**Ideas**
- [ ] Empty submit shows the inline error; 3-char submit shows the minimum-length error.
- [ ] Counters cap at 140 / 400; over-limit text is refused.
- [ ] Save shows the confirmation banner; the card appears with a timestamp.
- [ ] Edit loads the record, saves changes, marks it “edited”; Delete removes it.
- [ ] Domain filter counts are correct; all three sorts order the list as labelled.
- [ ] Reload the page → ideas, filters and sort persist (localStorage).
- [ ] Private browsing / storage disabled → no crash, session-only behaviour.

**State & navigation**
- [ ] Selecting a domain from the roadmap panel switches the scene and the nav tab together.
- [ ] `1–5`, `V`, `M`, `P`, `Esc` shortcuts work and do not fire while typing in a field.
- [ ] Panel collapse hides the dock and reveals the re-open tab.

**Responsive & a11y**
- [ ] 360 px phone: nav tabs scroll, dock becomes a bottom sheet, 3D visible above it.
- [ ] Tablet and 1440 px desktop: dock is right-aligned, no overlap with the status bar.
- [ ] Full keyboard traversal: nav → dock → form → lists, with visible focus rings.
- [ ] Screen reader: the WebGL stage is `aria-hidden`; the 2D stage is a labelled group; all
      toggles expose `aria-pressed`, filters expose `aria-pressed`, errors expose `role="alert"`.
- [ ] Enable OS “reduce motion” → no CSS animations, no camera easing, no bloom, static scene.

**Performance**
- [ ] Cycle quality HQ → BAL → LITE: visible DPR/bloom change, frame rate improves on LITE.
- [ ] Switch browser tabs → rendering pauses (no CPU/GPU usage) and resumes on return.
- [ ] Mid-range laptop / Android phone: sustained interactive frame rate in all three scenes.
