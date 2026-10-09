import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import { DOMAINS, DOMAIN_MAP, domainPosition } from "@/data/domains";
import { useClubStore } from "@/store/useClubStore";
import type { Domain } from "@/types";
import { GLOBE_RADIUS } from "./CameraRig";
import { GlowSprite, lerpAngle, useHoverCursor } from "./shared";

/**
 * The Innovation Globe — a navigable holographic sphere carrying one
 * interactive node per technology domain. Selecting a node spins the globe so
 * the node faces the viewer while the camera flies in; the DOM panel opens with
 * the same structured data.
 */

const R = GLOBE_RADIUS;

export function InnovationGlobe() {
  const activeId = useClubStore((s) => s.activeDomainId);
  const reduced = useClubStore((s) => s.reducedMotion);
  const group = useRef<THREE.Group>(null);
  const scanRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const dots = useMemo(() => {
    const count = 780;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = ((i * 2.399963229728653) % (Math.PI * 2)) + Math.PI;
      arr[i * 3] = Math.cos(theta) * radiusAtY * R * 0.985;
      arr[i * 3 + 1] = y * R * 0.985;
      arr[i * 3 + 2] = Math.sin(theta) * radiusAtY * R * 0.985;
    }
    return arr;
  }, []);

  const arcs = useMemo(() => {
    const out: Array<{ key: string; points: [number, number, number][]; ids: string[] }> = [];
    for (let i = 0; i < DOMAINS.length; i++) {
      const a = DOMAINS[i];
      const b = DOMAINS[(i + 1) % DOMAINS.length];
      const pa = new THREE.Vector3(...domainPosition(a, R));
      const pb = new THREE.Vector3(...domainPosition(b, R));
      const mid = pa.clone().add(pb).multiplyScalar(0.5).normalize().multiplyScalar(R * 1.22);
      const curve = new THREE.QuadraticBezierCurve3(pa, mid, pb);
      out.push({
        key: `${a.id}-${b.id}`,
        points: curve.getPoints(24).map((p) => [p.x, p.y, p.z] as [number, number, number]),
        ids: [a.id, b.id],
      });
    }
    return out;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      if (activeId) {
        const [x, , z] = domainPosition(DOMAIN_MAP[activeId], R);
        group.current.rotation.y = lerpAngle(
          group.current.rotation.y,
          -Math.atan2(x, z),
          reduced ? 1 : Math.min(1, delta * 3.2)
        );
      } else if (!reduced) {
        group.current.rotation.y += delta * 0.075;
      }
    }
    if (scanRef.current && !reduced) {
      scanRef.current.rotation.y -= delta * 0.35;
      scanRef.current.rotation.z = Math.sin(t * 0.3) * 0.35;
    }
    if (coreRef.current && !reduced) {
      const s = 1 + Math.sin(t * 1.4) * 0.06;
      coreRef.current.scale.setScalar(s);
    }
  });

  return (
    <group position={[0, 0.15, 0]}>
      {/* inner energy core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[R * 0.34, 24, 18]} />
        <meshBasicMaterial color="#2ce8ff" transparent opacity={0.22} toneMapped={false} />
      </mesh>
      <GlowSprite color="#2f9bff" scale={R * 2.1} opacity={0.22} />

      <group ref={group}>
        {/* holographic shell */}
        <mesh>
          <sphereGeometry args={[R, 36, 24]} />
          <meshBasicMaterial
            color="#3aa9ff"
            wireframe
            transparent
            opacity={0.13}
            toneMapped={false}
          />
        </mesh>

        {/* surface dot cloud */}
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[dots, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.028}
            sizeAttenuation
            color="#9fe8ff"
            transparent
            opacity={0.6}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </points>

        {/* connecting arcs — brighten when either endpoint is selected */}
        {arcs.map((arc) => {
          const on = activeId !== null && arc.ids.includes(activeId);
          return (
            <Line
              key={arc.key}
              points={arc.points}
              color={on ? "#7ef2ff" : "#1f4a7d"}
              lineWidth={on ? 1.8 : 0.9}
              transparent
              opacity={on ? 0.95 : 0.4}
            />
          );
        })}

        {/* domain nodes */}
        {DOMAINS.map((domain) => (
          <DomainNode key={domain.id} domain={domain} radius={R} />
        ))}
      </group>

      {/* equatorial scan rings (independent of globe spin) */}
      <mesh ref={scanRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R * 1.22, 0.006, 8, 128]} />
        <meshBasicMaterial color="#a06bff" transparent opacity={0.5} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2.6, 0.4, 0]}>
        <torusGeometry args={[R * 1.34, 0.004, 8, 128]} />
        <meshBasicMaterial color="#2ce8ff" transparent opacity={0.28} toneMapped={false} />
      </mesh>

      {/* base pedestal */}
      <mesh position={[0, -R - 0.5, 0]}>
        <cylinderGeometry args={[1.1, 1.5, 0.1, 48]} />
        <meshStandardMaterial color="#070d1b" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0, -R - 0.44, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.02, 1.12, 64]} />
        <meshBasicMaterial color="#2ce8ff" transparent opacity={0.45} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------- node mesh */

function DomainNode({ domain, radius }: { domain: Domain; radius: number }) {
  const activeId = useClubStore((s) => s.activeDomainId);
  const setActiveDomain = useClubStore((s) => s.setActiveDomain);
  const reduced = useClubStore((s) => s.reducedMotion);
  const { hovered, handlers } = useHoverCursor();

  const isActive = activeId === domain.id;
  const lit = isActive || hovered;
  const position = useMemo(() => domainPosition(domain, radius), [domain, radius]);

  const nodeRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const quaternion = useMemo(() => {
    const normal = new THREE.Vector3(...position).normalize();
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    return q;
  }, [position]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (nodeRef.current) {
      const target = isActive ? 1.85 : hovered ? 1.4 : 1;
      nodeRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
      if (!reduced) nodeRef.current.rotation.y += delta * 0.8;
    }
    if (ringRef.current && isActive && !reduced) {
      const p = (t * 0.55) % 1;
      ringRef.current.scale.setScalar(1 + p * 2.1);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.55 * (1 - p);
    }
  });

  return (
    <group position={position} quaternion={quaternion}>
      <group
        ref={nodeRef}
        onClick={(e) => {
          e.stopPropagation();
          setActiveDomain(isActive ? null : domain.id);
        }}
        onPointerOver={handlers.onPointerOver}
        onPointerOut={handlers.onPointerOut}
      >
        <mesh visible={false}>
          <sphereGeometry args={[0.26, 8, 8]} />
        </mesh>
        <mesh>
          <octahedronGeometry args={[0.11, 0]} />
          <meshStandardMaterial
            color={domain.color}
            emissive={domain.color}
            emissiveIntensity={lit ? 3.4 : 1.5}
            roughness={0.2}
            metalness={0.5}
            toneMapped={false}
          />
        </mesh>
        {/* collar ring lying on the surface */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <torusGeometry args={[0.17, 0.008, 8, 40]} />
          <meshBasicMaterial
            color={domain.color}
            transparent
            opacity={lit ? 0.95 : 0.5}
            toneMapped={false}
          />
        </mesh>
      </group>

      {isActive && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <ringGeometry args={[0.18, 0.2, 48]} />
          <meshBasicMaterial
            color={domain.color}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      <GlowSprite color={domain.color} scale={lit ? 1.5 : 0.85} opacity={lit ? 0.85 : 0.45} />

      {isActive && (
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.012, 0.05, 1.1, 12, 1, true]} />
          <meshBasicMaterial
            color={domain.color}
            transparent
            opacity={0.4}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      )}

      <Html
        center
        distanceFactor={7.5}
        position={[0, 0.36, 0]}
        style={{ pointerEvents: "none", userSelect: "none" }}
        zIndexRange={[30, 0]}
      >
        <div
          className="whitespace-nowrap text-center transition-opacity duration-300"
          style={{ opacity: lit ? 1 : 0.72 }}
        >
          <div
            className="font-display text-[12px] font-bold tracking-[0.14em] uppercase"
            style={{ color: lit ? domain.color : "#b7c9e4", textShadow: `0 0 16px ${domain.color}` }}
          >
            {domain.name}
          </div>
          <div className="text-[10px] tracking-wide text-[#7f97bb]">
            {domain.difficulty} · {domain.short}
          </div>
        </div>
      </Html>
    </group>
  );
}
