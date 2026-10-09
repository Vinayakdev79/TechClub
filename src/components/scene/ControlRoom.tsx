import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import { DOMAIN_MAP } from "@/data/domains";
import { ROADMAP } from "@/data/roadmap";
import { useClubStore } from "@/store/useClubStore";
import type { ModuleId } from "@/types";
import { GlowSprite, useHoverCursor } from "./shared";

/**
 * The Campaign Control Room — the hub that visually connects the three
 * interactive modules. Each pylon mirrors real application state:
 *   · Globe pylon   → tints to the currently selected technology domain
 *   · Circuit pylon → lights the number of the selected roadmap stage
 *   · Simulator     → bar heights follow the number of selected activities
 */

const PYLONS: Array<{
  id: ModuleId;
  label: string;
  caption: string;
  position: [number, number, number];
  color: string;
}> = [
  {
    id: "globe",
    label: "Innovation Globe",
    caption: "6 technology domains",
    position: [-2.95, 1.05, 1.15],
    color: "#35e6ff",
  },
  {
    id: "circuit",
    label: "Vision Circuit",
    caption: "4-stage roadmap",
    position: [2.95, 1.05, 1.15],
    color: "#a06bff",
  },
  {
    id: "simulator",
    label: "Build Your Club",
    caption: "activity simulator",
    position: [0, 1.05, -3.1],
    color: "#46f0b0",
  },
];

export function ControlRoom() {
  const module = useClubStore((s) => s.module);
  const setModule = useClubStore((s) => s.setModule);
  const reduced = useClubStore((s) => s.reducedMotion);
  const activeDomainId = useClubStore((s) => s.activeDomainId);
  const activeStageId = useClubStore((s) => s.activeStageId);
  const selected = useClubStore((s) => s.selectedActivities);

  const coreRef = useRef<THREE.Group>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);

  const coreColor = activeDomainId ? DOMAIN_MAP[activeDomainId].color : "#2ce8ff";
  const stageIndex = ROADMAP.findIndex((s) => s.id === activeStageId);

  useFrame((state, delta) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    if (shellRef.current) {
      shellRef.current.rotation.y += delta * 0.12;
      shellRef.current.rotation.x = Math.sin(t * 0.25) * 0.08;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y -= delta * 0.35;
      const s = 1 + Math.sin(t * 1.6) * 0.045;
      coreRef.current.scale.setScalar(s);
    }
    if (ringA.current) ringA.current.rotation.z += delta * 0.5;
    if (ringB.current) ringB.current.rotation.z -= delta * 0.33;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ---------------------------------------------------- central core */}
      <group position={[0, 1.35, 0]}>
        <group ref={coreRef}>
          <mesh>
            <icosahedronGeometry args={[0.42, 1]} />
            <meshStandardMaterial
              color={coreColor}
              emissive={coreColor}
              emissiveIntensity={2.1}
              roughness={0.25}
              metalness={0.4}
              toneMapped={false}
            />
          </mesh>
          <GlowSprite color={coreColor} scale={3.1} opacity={0.5} />
        </group>

        <mesh ref={shellRef}>
          <icosahedronGeometry args={[1.15, 2]} />
          <meshBasicMaterial
            color="#7fd8ff"
            wireframe
            transparent
            opacity={0.2}
            toneMapped={false}
          />
        </mesh>

        <mesh ref={ringA} rotation={[Math.PI / 2.2, 0, 0]}>
          <torusGeometry args={[1.55, 0.012, 8, 96]} />
          <meshBasicMaterial color="#2ce8ff" transparent opacity={0.75} toneMapped={false} />
        </mesh>
        <mesh ref={ringB} rotation={[Math.PI / 1.7, 0.5, 0]}>
          <torusGeometry args={[1.85, 0.008, 8, 96]} />
          <meshBasicMaterial color="#a06bff" transparent opacity={0.55} toneMapped={false} />
        </mesh>

        {/* light column */}
        <mesh position={[0, -1.35, 0]}>
          <cylinderGeometry args={[0.5, 0.9, 2.7, 24, 1, true]} />
          <meshBasicMaterial
            color={coreColor}
            transparent
            opacity={0.07}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* -------------------------------------------------------- platform */}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <cylinderGeometry args={[4.1, 4.3, 0.12, 64]} />
        <meshStandardMaterial color="#070d1b" metalness={0.85} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.85, 4.02, 96]} />
        <meshBasicMaterial color="#2ce8ff" transparent opacity={0.5} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.15, 2.19, 96]} />
        <meshBasicMaterial color="#2f9bff" transparent opacity={0.35} toneMapped={false} />
      </mesh>

      {/* --------------------------------------------------------- pylons */}
      {PYLONS.map((p) => (
        <Pylon
          key={p.id}
          {...p}
          active={module === p.id}
          onSelect={() => setModule(p.id)}
          reduced={reduced}
          variant={p.id}
          coreColor={coreColor}
          selectedCount={selected.length}
          stageIndex={stageIndex}
        />
      ))}

      {/* traces from the core to each pylon */}
      {PYLONS.map((p) => (
        <Line
          key={`trace-${p.id}`}
          points={[
            [0, 1.35, 0],
            [p.position[0] * 0.45, 0.35, p.position[2] * 0.45],
            p.position,
          ]}
          color={module === p.id ? p.color : "#1d3b63"}
          lineWidth={module === p.id ? 2 : 1}
          transparent
          opacity={module === p.id ? 0.9 : 0.45}
          dashed={module !== p.id}
          dashSize={0.16}
          gapSize={0.14}
        />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ Pylon */

interface PylonProps {
  id: ModuleId;
  label: string;
  caption: string;
  position: [number, number, number];
  color: string;
  active: boolean;
  reduced: boolean;
  variant: ModuleId;
  coreColor: string;
  selectedCount: number;
  stageIndex: number;
  onSelect: () => void;
}

function Pylon({
  label,
  caption,
  position,
  color,
  active,
  reduced,
  variant,
  selectedCount,
  stageIndex,
  onSelect,
}: PylonProps) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const { hovered, handlers } = useHoverCursor();
  const lit = active || hovered;

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    if (!reduced) {
      group.current.position.y = position[1] + Math.sin(t * 0.9 + position[0]) * 0.09;
      if (inner.current) inner.current.rotation.y += delta * (active ? 0.9 : 0.35);
    }
    const target = lit ? 1.12 : 1;
    group.current.scale.lerp(new THREE.Vector3(target, target, target), 0.12);
  });

  const bars = useMemo(() => [0, 1, 2, 3], []);

  return (
    <group position={position}>
      <group ref={group}>
        <group
          ref={inner}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          onPointerOver={handlers.onPointerOver}
          onPointerOut={handlers.onPointerOut}
        >
          {/* invisible generous hit area so touch works easily */}
          <mesh visible={false}>
            <sphereGeometry args={[0.85, 8, 8]} />
          </mesh>

          {variant === "globe" && (
            <>
              <mesh>
                <sphereGeometry args={[0.42, 24, 16]} />
                <meshBasicMaterial
                  color={color}
                  wireframe
                  transparent
                  opacity={lit ? 0.85 : 0.45}
                  toneMapped={false}
                />
              </mesh>
              <mesh>
                <sphereGeometry args={[0.2, 16, 12]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={lit ? 2.4 : 0.9}
                  toneMapped={false}
                />
              </mesh>
            </>
          )}

          {variant === "circuit" && (
            <>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <boxGeometry args={[0.78, 0.78, 0.09]} />
                <meshStandardMaterial
                  color="#0a1424"
                  emissive={color}
                  emissiveIntensity={lit ? 0.9 : 0.35}
                  metalness={0.7}
                  roughness={0.3}
                />
              </mesh>
              <mesh position={[0, 0.09, 0]}>
                <boxGeometry args={[0.3, 0.12, 0.3]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={lit ? 3 : 1.2}
                  toneMapped={false}
                />
              </mesh>
              {stageIndex >= 0 && (
                <mesh position={[0, 0.42, 0]}>
                  <octahedronGeometry args={[0.13, 0]} />
                  <meshBasicMaterial color="#ffffff" toneMapped={false} />
                </mesh>
              )}
            </>
          )}

          {variant === "simulator" && (
            <>
              {bars.map((i) => {
                const h =
                  0.18 +
                  (selectedCount > i
                    ? 0.2 + ((selectedCount - i) % 4) * 0.12
                    : 0.05);
                const angle = (i / bars.length) * Math.PI * 2;
                return (
                  <mesh
                    key={i}
                    position={[Math.cos(angle) * 0.24, h / 2 - 0.25, Math.sin(angle) * 0.24]}
                  >
                    <boxGeometry args={[0.13, h, 0.13]} />
                    <meshStandardMaterial
                      color={color}
                      emissive={color}
                      emissiveIntensity={selectedCount > i ? (lit ? 3 : 1.6) : 0.35}
                      toneMapped={false}
                    />
                  </mesh>
                );
              })}
              <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.36, 0.44, 32]} />
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={lit ? 0.9 : 0.4}
                  toneMapped={false}
                />
              </mesh>
            </>
          )}

          {/* containment ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.62, 0.008, 8, 48]} />
            <meshBasicMaterial
              color={lit ? color : "#24406a"}
              transparent
              opacity={lit ? 0.95 : 0.5}
              toneMapped={false}
            />
          </mesh>
        </group>

        <GlowSprite color={color} scale={lit ? 2.6 : 1.7} opacity={lit ? 0.55 : 0.28} />

        <Html
          center
          distanceFactor={9}
          position={[0, -0.95, 0]}
          style={{ pointerEvents: "none", userSelect: "none" }}
          zIndexRange={[20, 0]}
        >
          <div
            className="whitespace-nowrap text-center"
            style={{ opacity: lit ? 1 : 0.62, transition: "opacity .25s" }}
          >
            <div
              className="font-display text-[13px] font-bold tracking-[0.16em] uppercase"
              style={{ color: lit ? color : "#9fb6d8", textShadow: `0 0 14px ${color}` }}
            >
              {label}
            </div>
            <div className="mt-0.5 text-[11px] tracking-wide text-[#7f97bb]">{caption}</div>
          </div>
        </Html>
      </group>
    </group>
  );
}
