import { Suspense, lazy, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cpu, Loader2, MessageSquareText, Sparkles } from "lucide-react";
import { StatusBar, TopBar } from "@/components/Nav";
import { Btn } from "@/components/ui/primitives";
import { GlobePanel } from "@/components/panels/GlobePanel";
import { CircuitPanel } from "@/components/panels/CircuitPanel";
import { SimulatorPanel } from "@/components/panels/SimulatorPanel";
import { IdeasPanel } from "@/components/panels/IdeasPanel";
import { ProfilePanel } from "@/components/panels/ProfilePanel";
import { MODULE_LABEL, initialiseCapabilities, useClubStore } from "@/store/useClubStore";
import type { ModuleId } from "@/types";
import { cn } from "@/utils/cn";

const SceneRoot = lazy(() => import("@/components/scene/SceneRoot"));
const Stage2D = lazy(() => import("@/components/Stage2D"));

const WIDE_MODULES: ModuleId[] = ["simulator", "ideas"];
const MODULE_ORDER: ModuleId[] = ["profile", "globe", "circuit", "simulator", "ideas"];

export default function App() {
  const module = useClubStore((s) => s.module);
  const view2D = useClubStore((s) => s.view2D);
  const webglAvailable = useClubStore((s) => s.webglAvailable);
  const sceneStatus = useClubStore((s) => s.sceneStatus);
  const setModule = useClubStore((s) => s.setModule);
  const setView2D = useClubStore((s) => s.setView2D);
  const setReducedMotion = useClubStore((s) => s.setReducedMotion);
  const setActiveDomain = useClubStore((s) => s.setActiveDomain);
  const setActiveStage = useClubStore((s) => s.setActiveStage);
  const reducedMotion = useClubStore((s) => s.reducedMotion);
  const hydrated = useClubStore((s) => s.hydrated);
  const setSceneStatus = useClubStore((s) => s.setSceneStatus);

  /* Desktop starts with the information dock open; small screens start on the
     bare 3D stage (hero + scene) so the lab is the first thing you see. */
  const [panelOpen, setPanelOpen] = useState(
    () => typeof window === "undefined" || window.innerWidth >= 1024
  );

  const activeDomainId = useClubStore((s) => s.activeDomainId);
  const activeStageId = useClubStore((s) => s.activeStageId);

  /* selecting a 3D node on a phone opens the sheet that explains it */
  useEffect(() => {
    if ((activeDomainId || activeStageId) && window.innerWidth < 1024) {
      setPanelOpen(true);
    }
  }, [activeDomainId, activeStageId]);
  /** Guards the first frame so the Canvas is never mounted before WebGL is probed. */
  const [probed, setProbed] = useState(false);

  /* one-time capability probe + safety nets */
  useEffect(() => {
    initialiseCapabilities();
    setProbed(true);
    const state = useClubStore.getState();
    if (!state.view2D && state.webglAvailable) setSceneStatus("loading");

    // Never let a failed rehydrate or a stalled 3D boot block the interface.
    const hydrationGuard = window.setTimeout(
      () => useClubStore.setState({ hydrated: true }),
      900
    );
    const bootGuard = window.setTimeout(() => {
      const s = useClubStore.getState();
      if (s.sceneStatus === "loading") {
        s.setSceneStatus("error");
        useClubStore.setState({ view2D: true });
      }
    }, 9000);

    return () => {
      window.clearTimeout(hydrationGuard);
      window.clearTimeout(bootGuard);
    };
  }, [setSceneStatus]);

  /* keyboard shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable)
      ) {
        if (e.key === "Escape") el.blur();
        return;
      }
      const s = useClubStore.getState();

      if (e.key >= "1" && e.key <= "5") {
        e.preventDefault();
        setModule(MODULE_ORDER[Number(e.key) - 1]);
        return;
      }
      switch (e.key.toLowerCase()) {
        case "v":
          if (s.webglAvailable) setView2D(!s.view2D);
          break;
        case "m":
          setReducedMotion(!s.reducedMotion);
          break;
        case "p":
          setPanelOpen((o) => !o);
          break;
        case "escape":
          if (s.activeDomainId || s.activeStageId) {
            setActiveDomain(null);
            setActiveStage(null);
          } else {
            setPanelOpen((o) => !o);
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setModule, setView2D, setReducedMotion, setActiveDomain, setActiveStage]);

  const use3D = webglAvailable && !view2D;
  const dockWidth = WIDE_MODULES.includes(module) ? 552 : 428;

  return (
    <div
      className={cn(
        "lab-backdrop relative h-full w-full overflow-hidden",
        reducedMotion && "reduced-motion"
      )}
      style={{ ["--dock-w" as string]: `${dockWidth}px` }}
    >
      {/* ------------------------------------------------------ stage */}
      <div
        className="absolute inset-0"
        {...(use3D
          ? { "aria-hidden": true }
          : { role: "group", "aria-label": "Interactive 2D stage — all modules are operable here" })}
      >
        {probed &&
          (use3D ? (
            /* the extra right padding recentres the projection in the space
               that is actually visible next to the information dock */
            <div
              className={cn(
                "absolute inset-0",
                panelOpen && "lg:pr-[calc(var(--dock-w)/2)]"
              )}
            >
              <Suspense fallback={null}>
                <SceneRoot />
              </Suspense>
            </div>
          ) : (
            <Suspense fallback={null}>
              <Stage2D />
            </Suspense>
          ))}
      </div>

      {/* ambient overlays */}
      <div className="lab-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(3,6,14,0.82)_100%)]" />

      {/* module transition wipe */}
      <AnimatePresence>
        {!reducedMotion && (
          <motion.div
            key={`veil-${module}`}
            initial={{ opacity: 0.55, scaleY: 0.02 }}
            animate={{ opacity: 0, scaleY: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 z-20 origin-center bg-gradient-to-b from-transparent via-cyan/12 to-transparent"
          />
        )}
      </AnimatePresence>

      {/* 3D boot loader */}
      <AnimatePresence>
        {use3D && sceneStatus === "loading" && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-30 grid place-items-center"
          >
            <div className="hud hud-corner flex items-center gap-3 px-4 py-3">
              <Loader2 size={16} className="animate-spin text-cyan" />
              <div>
                <p className="font-display text-[11px] tracking-[0.24em] text-ice uppercase">
                  Initialising 3D lab
                </p>
                <p className="text-[10.5px] text-mute">
                  Compiling shaders · building geometry
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WebGL unavailable banner */}
      {!webglAvailable && (
        <div className="pointer-events-auto absolute top-16 left-1/2 z-40 w-[min(92vw,460px)] -translate-x-1/2">
          <div
            className="hud flex items-start gap-2.5 p-3"
            style={{ borderColor: "rgba(255,196,107,0.45)" }}
          >
            <Cpu size={15} className="mt-0.5 shrink-0 text-amber" />
            <div>
              <p className="text-[12px] font-semibold text-ice">
                3D rendering is unavailable on this device
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-mute">
                The full accessible 2D interface is active instead — every module, node and
                interaction still works.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------- hero overlay */}
      <AnimatePresence>
        {module === "profile" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(
              "pointer-events-none absolute bottom-24 left-4 z-20 max-w-lg sm:left-6 lg:bottom-28",
              panelOpen ? "hidden lg:block" : "block"
            )}
          >
            <p className="flex items-center gap-2 font-display text-[10px] tracking-[0.34em] text-cyan uppercase">
              <span className="h-px w-8 bg-cyan" />
              Advance Tech Club · Presidential campaign
            </p>
            <h1 className="mt-3 font-display text-[clamp(2rem,6.4vw,3.6rem)] leading-[0.92] font-black tracking-tight text-ice uppercase">
              Vinayak
              <br />
              <span className="text-cyan drop-shadow-[0_0_28px_rgba(44,232,255,0.45)]">
                Katiyar
              </span>
            </h1>
            <p className="mt-3 font-display text-[13px] tracking-[0.22em] text-ice/90 uppercase sm:text-[15px]">
              Learn. Build. Innovate. Together.
            </p>
            <p className="mt-3 max-w-md text-[12.5px] leading-relaxed text-mute">
              An interactive technology lab rather than a poster: rotate the Innovation Globe, walk
              the proposed Vision Circuit, compose an activity plan and leave your own idea in the
              console.
            </p>
            <div className="pointer-events-auto mt-4 flex flex-wrap gap-2">
              <Btn variant="primary" onClick={() => setModule("globe")}>
                <Sparkles size={13} /> Enter the Innovation Globe
              </Btn>
              <Btn variant="outline" onClick={() => setModule("ideas")}>
                <MessageSquareText size={13} /> Propose an idea
              </Btn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------ chrome */}
      <TopBar panelOpen={panelOpen} onTogglePanel={() => setPanelOpen((o) => !o)} />
      <StatusBar />

      {/* -------------------------------------------------- information dock */}
      <div
        className={cn(
          "absolute z-30 transition-all duration-300 ease-out",
          "inset-x-0 bottom-[54px] top-auto lg:inset-x-auto lg:top-[62px] lg:bottom-[54px] lg:right-4",
          panelOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-6 opacity-0 lg:translate-x-8 lg:translate-y-0"
        )}
        style={{ maxWidth: "100%" }}
        aria-hidden={!panelOpen}
      >
        <div
          className="hud hud-corner thin-scroll mx-auto flex max-h-[68vh] w-full flex-col overflow-y-auto lg:mx-0 lg:max-h-none lg:h-full lg:w-[var(--dock-w)]"
          style={{ boxShadow: "0 30px 80px -40px rgba(0,0,0,0.95)" }}
        >
          {/* sheet handle (touch) */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-line/70 bg-void/90 px-3 py-2 lg:hidden">
            <span className="font-display text-[10px] tracking-[0.22em] text-cyan uppercase">
              {MODULE_LABEL[module]}
            </span>
            <button
              onClick={() => setPanelOpen(false)}
              className="border border-line px-2 py-1 text-[10px] tracking-widest text-mute uppercase"
            >
              Hide
            </button>
          </div>

          <div className="scanlines pointer-events-none absolute inset-x-0 top-0 h-16 overflow-hidden opacity-40 lg:hidden" />

          <div className="relative flex-1 p-2.5 sm:p-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={module}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : -8 }}
                transition={{ duration: 0.24 }}
              >
                {module === "profile" && <ProfilePanel />}
                {module === "globe" && <GlobePanel />}
                {module === "circuit" && <CircuitPanel />}
                {module === "simulator" && <SimulatorPanel />}
                {module === "ideas" && <IdeasPanel />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* mobile re-open tab */}
      <AnimatePresence>
        {!panelOpen && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => setPanelOpen(true)}
            className="pointer-events-auto absolute bottom-[64px] left-1/2 z-40 -translate-x-1/2 border border-cyan/50 bg-void/90 px-4 py-2 font-display text-[10px] tracking-[0.22em] text-cyan uppercase backdrop-blur"
          >
            Open {MODULE_LABEL[module]} panel
          </motion.button>
        )}
      </AnimatePresence>

      {/* first-visit hydration guard: nothing to render until prefs are read */}
      {!hydrated && (
        <div className="pointer-events-none absolute inset-0 z-50 bg-void" aria-hidden="true" />
      )}
    </div>
  );
}
