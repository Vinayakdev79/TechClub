import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  DomainId,
  Idea,
  LevelFilter,
  ModuleId,
  SortKey,
} from "@/types";
import {
  detectCapability,
  detectWebGL,
  prefersReducedMotion,
  uid,
  type Capability,
} from "@/lib/env";

export type SceneId = "control" | "globe" | "circuit";
export type SceneStatus = "idle" | "loading" | "ready" | "error";

export const MODULE_SCENE: Record<ModuleId, SceneId> = {
  profile: "control",
  globe: "globe",
  circuit: "circuit",
  simulator: "control",
  ideas: "control",
};

export const MODULE_LABEL: Record<ModuleId, string> = {
  profile: "Candidate",
  globe: "Innovation Globe",
  circuit: "Vision Circuit",
  simulator: "Build Your Club",
  ideas: "Idea Console",
};

interface ClubState {
  /* navigation & 3D synchronisation */
  module: ModuleId;
  scene: SceneId;
  activeDomainId: DomainId | null;
  activeStageId: string | null;
  cameraNonce: number;

  /* simulator */
  selectedActivities: string[];
  levelFilter: LevelFilter;

  /* idea console */
  ideas: Idea[];
  ideaDomainFilter: DomainId | "all" | "general";
  ideaSort: SortKey;
  editingIdeaId: string | null;
  lastIdeaAction: { type: "saved" | "updated" | "removed"; id: string } | null;

  /* preferences & capability */
  reducedMotion: boolean;
  capability: Capability;
  view2D: boolean;
  webglAvailable: boolean;
  sceneStatus: SceneStatus;
  navOpen: boolean;
  hydrated: boolean;

  /* actions */
  setModule: (m: ModuleId) => void;
  setActiveDomain: (id: DomainId | null) => void;
  setActiveStage: (id: string | null) => void;
  refocusCamera: () => void;
  toggleActivity: (id: string) => void;
  clearActivities: () => void;
  setLevelFilter: (l: LevelFilter) => void;
  addIdea: (input: Omit<Idea, "id" | "createdAt" | "updatedAt">) => void;
  updateIdea: (
    id: string,
    input: Omit<Idea, "id" | "createdAt" | "updatedAt">
  ) => void;
  removeIdea: (id: string) => void;
  setEditingIdea: (id: string | null) => void;
  setIdeaDomainFilter: (d: DomainId | "all" | "general") => void;
  setIdeaSort: (s: SortKey) => void;
  clearIdeas: () => void;
  setReducedMotion: (v: boolean) => void;
  setCapability: (c: Capability) => void;
  setView2D: (v: boolean) => void;
  setWebglAvailable: (v: boolean) => void;
  setSceneStatus: (s: SceneStatus) => void;
  setNavOpen: (v: boolean) => void;
  setHydrated: (v: boolean) => void;
}

const initialReducedMotion = prefersReducedMotion();

export const useClubStore = create<ClubState>()(
  persist(
    (set, get) => ({
      module: "profile",
      scene: "control",
      activeDomainId: null,
      activeStageId: null,
      cameraNonce: 0,

      selectedActivities: [],
      levelFilter: "all",

      ideas: [],
      ideaDomainFilter: "all",
      ideaSort: "newest",
      editingIdeaId: null,
      lastIdeaAction: null,

      reducedMotion: initialReducedMotion,
      // Probed once at module init; a persisted user choice always wins on rehydrate.
      capability: detectCapability(),
      view2D: false,
      webglAvailable: true,
      sceneStatus: "idle",
      navOpen: false,
      hydrated: false,

      setModule: (m) =>
        set({
          module: m,
          scene: MODULE_SCENE[m],
          navOpen: false,
          cameraNonce: get().cameraNonce + 1,
          // Entering a module clears the previous module's 3D selection so the
          // camera always flies to a deterministic framing.
          activeDomainId: m === "globe" ? get().activeDomainId : null,
          activeStageId: m === "circuit" ? get().activeStageId : null,
        }),

      setActiveDomain: (id) =>
        set({
          activeDomainId: id,
          module: id ? "globe" : get().module,
          scene: id ? "globe" : get().scene,
          cameraNonce: get().cameraNonce + 1,
        }),

      setActiveStage: (id) =>
        set({
          activeStageId: id,
          module: id ? "circuit" : get().module,
          scene: id ? "circuit" : get().scene,
          cameraNonce: get().cameraNonce + 1,
        }),

      refocusCamera: () => set({ cameraNonce: get().cameraNonce + 1 }),

      toggleActivity: (id) => {
        const current = get().selectedActivities;
        set({
          selectedActivities: current.includes(id)
            ? current.filter((a) => a !== id)
            : [...current, id],
        });
      },

      clearActivities: () => set({ selectedActivities: [] }),
      setLevelFilter: (l) => set({ levelFilter: l }),

      addIdea: (input) => {
        const now = Date.now();
        const idea: Idea = { ...input, id: uid(), createdAt: now, updatedAt: now };
        set({
          ideas: [idea, ...get().ideas],
          lastIdeaAction: { type: "saved", id: idea.id },
          editingIdeaId: null,
        });
      },

      updateIdea: (id, input) => {
        set({
          ideas: get().ideas.map((i) =>
            i.id === id ? { ...i, ...input, updatedAt: Date.now() } : i
          ),
          lastIdeaAction: { type: "updated", id },
          editingIdeaId: null,
        });
      },

      removeIdea: (id) =>
        set({
          ideas: get().ideas.filter((i) => i.id !== id),
          lastIdeaAction: { type: "removed", id },
          editingIdeaId: get().editingIdeaId === id ? null : get().editingIdeaId,
        }),

      setEditingIdea: (id) => set({ editingIdeaId: id }),
      setIdeaDomainFilter: (d) => set({ ideaDomainFilter: d }),
      setIdeaSort: (s) => set({ ideaSort: s }),
      clearIdeas: () => set({ ideas: [], editingIdeaId: null }),

      setReducedMotion: (v) => set({ reducedMotion: v }),
      setCapability: (c) => set({ capability: c }),
      setView2D: (v) => set({ view2D: v }),
      setWebglAvailable: (v) => set({ webglAvailable: v }),
      setSceneStatus: (s) => set({ sceneStatus: s }),
      setNavOpen: (v) => set({ navOpen: v }),
      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: "atc.campaign.v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (s) => ({
        ideas: s.ideas,
        selectedActivities: s.selectedActivities,
        levelFilter: s.levelFilter,
        ideaDomainFilter: s.ideaDomainFilter,
        ideaSort: s.ideaSort,
        reducedMotion: s.reducedMotion,
        capability: s.capability,
        view2D: s.view2D,
      }) as Partial<ClubState>,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

/**
 * Called once on mount: probes WebGL and picks a capability tier unless the
 * visitor already stored a preference.
 */
export function initialiseCapabilities() {
  const state = useClubStore.getState();
  const webgl = detectWebGL();
  useClubStore.setState({
    webglAvailable: webgl,
    // No WebGL context → the accessible 2D interface is forced on.
    view2D: webgl ? state.view2D : true,
  });
}

/* --- selectors (kept outside the store so components can memoise them) --- */

export const selectScene = (s: ClubState) => s.scene;
export const selectModule = (s: ClubState) => s.module;
