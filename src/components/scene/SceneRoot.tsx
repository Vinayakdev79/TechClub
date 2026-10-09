import { Component, Suspense, lazy, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useClubStore } from "@/store/useClubStore";
import { Starfield, useVisibilityFrameloop } from "./shared";
import { CameraRig } from "./CameraRig";
import { ControlRoom } from "./ControlRoom";
import { InnovationGlobe } from "./InnovationGlobe";
import { VisionCircuit } from "./VisionCircuit";

const SceneEffects = lazy(() => import("./SceneEffects"));

const DPR: Record<string, [number, number]> = {
  high: [1, 2],
  balanced: [1, 1.5],
  lite: [1, 1],
};

/* --------------------------------------------------- WebGL error boundary */

class SceneErrorBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[3D scene failed]", error);
    this.props.onError();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

/* ------------------------------------------------------------------ scene */

function SceneContent() {
  const scene = useClubStore((s) => s.scene);
  return (
    <>
      {scene === "control" && <ControlRoom />}
      {scene === "globe" && <InnovationGlobe />}
      {scene === "circuit" && <VisionCircuit />}
    </>
  );
}

export default function SceneRoot() {
  const capability = useClubStore((s) => s.capability);
  const setSceneStatus = useClubStore((s) => s.setSceneStatus);
  const setActiveDomain = useClubStore((s) => s.setActiveDomain);
  const setActiveStage = useClubStore((s) => s.setActiveStage);
  const frameloop = useVisibilityFrameloop();

  return (
    <SceneErrorBoundary
      onError={() => {
        setSceneStatus("error");
        useClubStore.setState({ view2D: true });
      }}
    >
      <Canvas
        frameloop={frameloop}
        dpr={DPR[capability] ?? DPR.balanced}
        camera={{ position: [0, 2.35, 8.7], fov: 45, near: 0.1, far: 120 }}
        gl={{
          antialias: capability !== "lite",
          alpha: false,
          stencil: false,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor("#03060e", 1);
          setSceneStatus("ready");
        }}
        onPointerMissed={() => {
          setActiveDomain(null);
          setActiveStage(null);
        }}
        className="absolute inset-0"
      >
        <color attach="background" args={["#03060e"]} />
        <fog attach="fog" args={["#03060e", 16, 40]} />

        <ambientLight intensity={0.5} color="#7fb0ff" />
        <directionalLight position={[5, 9, 6]} intensity={1.1} color="#d6ecff" />
        <pointLight position={[-6, 3.5, 4]} intensity={45} distance={30} decay={2} color="#2ce8ff" />
        <pointLight position={[6, 2.5, -5]} intensity={38} distance={30} decay={2} color="#a06bff" />
        <pointLight position={[0, -3, 2]} intensity={18} distance={22} decay={2} color="#2f9bff" />

        <Suspense fallback={null}>
          <Starfield count={capability === "lite" ? 180 : 420} />
          <SceneContent />
          <SceneEffects />
        </Suspense>

        <CameraRig />
        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.075}
          rotateSpeed={0.55}
          zoomSpeed={0.75}
          minDistance={3.2}
          maxDistance={17}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI * 0.62}
          target={[0, 0.8, 0]}
        />
      </Canvas>
    </SceneErrorBoundary>
  );
}
