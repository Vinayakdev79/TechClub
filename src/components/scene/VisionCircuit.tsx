import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Grid, Html, Line } from "@react-three/drei";
import { DOMAIN_MAP } from "@/data/domains";
import { ROADMAP, STAGE_MAP, TRACES } from "@/data/roadmap";
import { useClubStore } from "@/store/useClubStore";
import type { RoadmapStage } from "@/types";
import { GlowSprite, useHoverCursor } from "./shared";

/**
 * The Vision Circuit — the proposed four-stage roadmap rendered as a PCB.
 * Clicking a stage flies the camera to it and energises the copper traces that
 * represent its dependencies. All stages stay reachable at any time.
 */

const TRACE_Y = 0.035;

function tracePoints(from: RoadmapStage, to: RoadmapStage): [number, number, number][] {
  const [ax, , az] = from.position;
  const [bx, , bz] = to.position;
  return [
    [ax, TRACE_Y, az],
    [ax, TRACE_Y, bz],
    [bx, TRACE_Y, bz],
  ];
}

export function VisionCircuit() {
  const activeId = useClubStore((s) => s.activeStageId);
  const reduced = useClubStore((s) => s.reducedMotion);

  const relatedForActive = useMemo(() => {
    const stage = ROADMAP.find((s) => s.id === activeId);
    return new Set(stage?.relatedDomains ?? []);
  }, [activeId]);

  return (
    <group position={[0, -0.4, 0]}>
      {/* ---------------------------------------------------------- board */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[13.4, 0.2, 7.6]} />
        <meshStandardMaterial color="#050d18" metalness={0.72} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[13.2, 7.4]} />
        <meshBasicMaterial color="#071a26" transparent opacity={0.9} toneMapped={false} />
      </mesh>
      <Grid
        position={[0, 0.012, 0]}
        args={[13.2, 7.4]}
        cellSize={0.4}
        cellThickness={0.5}
        cellColor="#0f3550"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#15607f"
        fadeDistance={26}
        fadeStrength={1.2}
        followCamera={false}
      />
      {/* board edge glow */}
      <Line
        points={[
          [-6.6, 0.02, -3.7],
          [6.6, 0.02, -3.7],
          [6.6, 0.02, 3.7],
          [-6.6, 0.02, 3.7],
          [-6.6, 0.02, -3.7],
        ]}
        color="#2ce8ff"
        lineWidth={1.4}
        transparent
        opacity={0.55}
      />

      {/* --------------------------------------------------------- traces */}
      {TRACES.map(({ from, to }) => {
        const a = STAGE_MAP[from];
        const b = STAGE_MAP[to];
        if (!a || !b) return null;
        const energised = activeId === to || activeId === from;
        const points = tracePoints(a, b);
        return (
          <group key={`${from}-${to}`}>
            <Line
              points={points}
              color={energised ? b.color : "#123a52"}
              lineWidth={energised ? 3 : 1.4}
              transparent
              opacity={energised ? 1 : 0.55}
            />
            {energised && !reduced && <TracePulse points={points} color={b.color} />}
          </group>
        );
      })}

      {/* --------------------------------------------------- passive parts */}
      {SMD_PARTS.map((p, i) => (
        <mesh key={i} position={[p.x, 0.05, p.z]} rotation={[0, p.r, 0]}>
          <boxGeometry args={[p.w, 0.06, p.h]} />
          <meshStandardMaterial
            color={relatedForActive.has(p.domain) ? "#1d5f7a" : "#0c1c2b"}
            emissive={relatedForActive.has(p.domain) ? DOMAIN_MAP[p.domain].color : "#000000"}
            emissiveIntensity={relatedForActive.has(p.domain) ? 0.7 : 0}
            metalness={0.6}
            roughness={0.5}
          />
        </mesh>
      ))}

      {/* ---------------------------------------------------- stage nodes */}
      {ROADMAP.map((stage) => (
        <StageNode key={stage.id} stage={stage} />
      ))}

      {/* ------------------------------------------------------- caption */}
      <Html
        center
        distanceFactor={11}
        position={[0, 0.05, 3.35]}
        style={{ pointerEvents: "none", userSelect: "none" }}
        zIndexRange={[10, 0]}
      >
        <div className="whitespace-nowrap text-center font-display text-[11px] tracking-[0.3em] text-[#4d7fa3] uppercase">
          Proposed roadmap · subject to club approval
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------- stage node */

function StageNode({ stage }: { stage: RoadmapStage }) {
  const activeId = useClubStore((s) => s.activeStageId);
  const setActiveStage = useClubStore((s) => s.setActiveStage);
  const reduced = useClubStore((s) => s.reducedMotion);
  const { hovered, handlers } = useHoverCursor();

  const isActive = activeId === stage.id;
  const isDependency =
    activeId !== null && STAGE_MAP[activeId]?.dependencies.includes(stage.id);
  const lit = isActive || hovered || isDependency;

  const chip = useRef<THREE.Group>(null);
  const ripple = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (chip.current) {
      const targetY = isActive ? 0.5 : isDependency ? 0.3 : 0.22;
      chip.current.position.y = reduced
        ? targetY
        : THREE.MathUtils.lerp(
            chip.current.position.y,
            targetY + (reduced ? 0 : Math.sin(t * 1.2 + stage.index) * 0.035),
            0.1
          );
    }
    if (ripple.current && isActive && !reduced) {
      const p = (t * 0.5) % 1;
      ripple.current.scale.setScalar(1 + p * 3.4);
      (ripple.current.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - p);
    }
  });

  return (
    <group position={stage.position}>
      {/* pad */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.06, 6]} />
        <meshStandardMaterial
          color="#0b2233"
          emissive={stage.color}
          emissiveIntensity={lit ? 0.85 : 0.25}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.56, 0.62, 40]} />
        <meshBasicMaterial
          color={stage.color}
          transparent
          opacity={lit ? 0.9 : 0.35}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={ripple} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.66, 48]} />
        <meshBasicMaterial
          color={stage.color}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* chip */}
      <group
        ref={chip}
        position={[0, 0.22, 0]}
        onClick={(e) => {
          e.stopPropagation();
          setActiveStage(isActive ? null : stage.id);
        }}
        onPointerOver={handlers.onPointerOver}
        onPointerOut={handlers.onPointerOut}
      >
        <mesh visible={false}>
          <boxGeometry args={[1, 0.7, 1]} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.44, 0.16, 0.44]} />
          <meshStandardMaterial
            color="#08131f"
            emissive={stage.color}
            emissiveIntensity={lit ? 1.5 : 0.5}
            metalness={0.75}
            roughness={0.25}
          />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <octahedronGeometry args={[0.09, 0]} />
          <meshBasicMaterial color={stage.color} toneMapped={false} />
        </mesh>
        <GlowSprite color={stage.color} scale={lit ? 2.1 : 1.1} opacity={lit ? 0.6 : 0.3} />
      </group>

      {/* light column for the selected stage */}
      {isActive && (
        <mesh position={[0, 1.35, 0]}>
          <cylinderGeometry args={[0.06, 0.34, 2.6, 20, 1, true]} />
          <meshBasicMaterial
            color={stage.color}
            transparent
            opacity={0.16}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* related-domain markers */}
      {stage.relatedDomains.slice(0, 4).map((d, i) => {
        const angle = (i / Math.max(stage.relatedDomains.length, 1)) * Math.PI * 2 + 0.6;
        const domain = DOMAIN_MAP[d];
        const dimmed = activeId !== null && !isActive && !isDependency;
        return (
          <mesh
            key={d}
            position={[Math.cos(angle) * 0.82, 0.09, Math.sin(angle) * 0.82]}
          >
            <sphereGeometry args={[0.045, 10, 8]} />
            <meshBasicMaterial
              color={domain.color}
              transparent
              opacity={dimmed ? 0.25 : 0.95}
              toneMapped={false}
            />
          </mesh>
        );
      })}

      <Html
        center
        distanceFactor={9}
        position={[0, 1.05, 0]}
        style={{ pointerEvents: "none", userSelect: "none" }}
        zIndexRange={[25, 0]}
      >
        <div
          className="whitespace-nowrap text-center transition-opacity duration-300"
          style={{ opacity: lit ? 1 : 0.7 }}
        >
          <div className="flex items-center justify-center gap-2">
            <span
              className="font-display text-[11px] font-bold"
              style={{ color: "#03060e", background: stage.color, padding: "1px 5px" }}
            >
              {String(stage.index).padStart(2, "0")}
            </span>
            <span
              className="font-display text-[13px] font-bold tracking-[0.14em] uppercase"
              style={{ color: lit ? stage.color : "#b7c9e4", textShadow: `0 0 14px ${stage.color}` }}
            >
              {stage.title}
            </span>
          </div>
          <div className="mt-0.5 text-[10.5px] tracking-wide text-[#7f97bb]">{stage.tagline}</div>
        </div>
      </Html>
    </group>
  );
}

/* -------------------------------------------------------------- trace fx */

function TracePulse({
  points,
  color,
}: {
  points: [number, number, number][];
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => {
    const vectors = points.map((p) => new THREE.Vector3(p[0], p[1] + 0.04, p[2]));
    return new THREE.CatmullRomCurve3(vectors, false, "catmullrom", 0.05);
  }, [points]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = (state.clock.elapsedTime * 0.32) % 1;
    curve.getPointAt(t, ref.current.position);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.07, 12, 10]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

/* deterministic decorative surface-mount parts (no Math.random at runtime) */
const SMD_PARTS = [
  { x: -5.4, z: -2.6, w: 0.5, h: 0.22, r: 0.2, domain: "web" as const },
  { x: -5.1, z: 2.4, w: 0.34, h: 0.18, r: -0.5, domain: "ai" as const },
  { x: -2.9, z: 2.9, w: 0.6, h: 0.2, r: 0.9, domain: "iot" as const },
  { x: -2.4, z: -2.8, w: 0.4, h: 0.2, r: 0, domain: "robotics" as const },
  { x: 0.2, z: -3, w: 0.55, h: 0.22, r: 0.4, domain: "embedded" as const },
  { x: 0.6, z: 2.9, w: 0.35, h: 0.18, r: -0.2, domain: "security" as const },
  { x: 2.9, z: -2.9, w: 0.45, h: 0.2, r: 0.7, domain: "ai" as const },
  { x: 3.1, z: 2.8, w: 0.5, h: 0.22, r: -0.6, domain: "web" as const },
  { x: 5.3, z: -2.4, w: 0.38, h: 0.18, r: 0.1, domain: "robotics" as const },
  { x: 5.5, z: 2.6, w: 0.6, h: 0.2, r: 0.5, domain: "security" as const },
  { x: -0.2, z: 0.1, w: 1.5, h: 0.9, r: 0, domain: "iot" as const },
];
