import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useClubStore } from "@/store/useClubStore";

/* ------------------------------------------------------------ glow sprite */

let glowTexture: THREE.Texture | null = null;

function getGlowTexture(): THREE.Texture {
  if (glowTexture) return glowTexture;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.2, "rgba(255,255,255,0.62)");
    g.addColorStop(0.55, "rgba(255,255,255,0.16)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  glowTexture = new THREE.CanvasTexture(canvas);
  glowTexture.colorSpace = THREE.SRGBColorSpace;
  return glowTexture;
}

export function GlowSprite({
  color = "#2ce8ff",
  scale = 1.6,
  opacity = 0.75,
  position,
}: {
  color?: string;
  scale?: number;
  opacity?: number;
  position?: [number, number, number];
}) {
  const texture = useMemo(() => getGlowTexture(), []);
  return (
    <sprite position={position} scale={[scale, scale, scale]} renderOrder={2}>
      <spriteMaterial
        map={texture}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  );
}

/* -------------------------------------------------------------- starfield */

export function Starfield({ count = 420, radius = 26 }: { count?: number; radius?: number }) {
  const reduced = useClubStore((s) => s.reducedMotion);
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Deterministic pseudo-random spread (no Math.random at render time).
      const t = i / count;
      const phi = Math.acos(1 - 2 * ((i * 0.6180339887) % 1));
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = radius * (0.45 + 0.55 * ((t * 7.31) % 1));
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi) * 0.55;
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, [count, radius]);

  useFrame((_, delta) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.y += delta * 0.008;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        sizeAttenuation
        color="#8fd8ff"
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

/* ------------------------------------------------------------------- misc */

export function useHoverCursor() {
  const [hovered, setHovered] = useState(false);

  /* never leave a stale pointer cursor behind when a hovered node unmounts */
  useEffect(() => {
    return () => {
      document.body.style.cursor = "auto";
    };
  }, []);

  return useMemo(
    () => ({
      hovered,
      handlers: {
        onPointerOver: (e: { stopPropagation: () => void }) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        },
        onPointerOut: () => {
          setHovered(false);
          document.body.style.cursor = "auto";
        },
      },
    }),
    [hovered]
  );
}

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Shortest-path angle interpolation helper for the globe spin. */
export function lerpAngle(current: number, target: number, alpha: number) {
  let diff = ((target - current + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return current + diff * alpha;
}

/**
 * Pauses the render loop while the tab is hidden (battery / GPU friendly).
 * Returns the frameloop value to hand to <Canvas>.
 */
export function useVisibilityFrameloop(): "always" | "never" {
  const [loop, setLoop] = useState<"always" | "never">("always");
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onChange = () => setLoop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", onChange);
    onChange();
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);
  return loop;
}
