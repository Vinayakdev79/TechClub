import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { DOMAINS, domainPosition } from "@/data/domains";
import { ROADMAP } from "@/data/roadmap";
import { useClubStore, type SceneId } from "@/store/useClubStore";
import type { DomainId } from "@/types";
import { easeInOutCubic } from "./shared";

export const GLOBE_RADIUS = 2;
const FLIGHT_SECONDS = 1.15;

interface ControlsLike {
  target: THREE.Vector3;
  enabled: boolean;
  update: () => void;
  addEventListener: (type: string, cb: () => void) => void;
  removeEventListener: (type: string, cb: () => void) => void;
}

interface Destination {
  pos: THREE.Vector3;
  target: THREE.Vector3;
  key: string;
}

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/**
 * Single source of truth for camera framing. Both the 3D scene and the HUD
 * read the same store values, so the camera always lands somewhere meaningful.
 */
export function computeDestination(
  scene: SceneId,
  domainId: DomainId | null,
  stageId: string | null
): Destination {
  if (scene === "globe") {
    const domain = DOMAINS.find((d) => d.id === domainId);
    if (domain) {
      const [px, py, pz] = domainPosition(domain, GLOBE_RADIUS);
      const horiz = Math.hypot(px, pz);
      return {
        pos: v(1.15, py * 0.5 + 0.95, horiz + 3.05),
        target: v(0, py * 0.62, horiz * 0.5),
        key: `globe:${domain.id}`,
      };
    }
    return { pos: v(0.4, 1.15, 6.4), target: v(0, 0, 0), key: "globe:overview" };
  }

  if (scene === "circuit") {
    const stage = ROADMAP.find((s) => s.id === stageId);
    if (stage) {
      const [x, y, z] = stage.position;
      return {
        pos: v(x * 0.78, y + 2.75, z + 3.5),
        target: v(x, y + 0.25, z),
        key: `circuit:${stage.id}`,
      };
    }
    return { pos: v(0, 5.2, 8.8), target: v(0, 0, -0.2), key: "circuit:overview" };
  }

  return { pos: v(0, 2.35, 8.7), target: v(0, 0.75, 0), key: "control" };
}

export function CameraRig() {
  const rawControls = useThree((s) => s.controls) as unknown as ControlsLike | null;
  const camera = useThree((s) => s.camera);

  const scene = useClubStore((s) => s.scene);
  const domainId = useClubStore((s) => s.activeDomainId);
  const stageId = useClubStore((s) => s.activeStageId);
  const nonce = useClubStore((s) => s.cameraNonce);
  const reduced = useClubStore((s) => s.reducedMotion);

  const dest = useMemo(
    () => computeDestination(scene, domainId, stageId),
    [scene, domainId, stageId]
  );

  const flight = useRef({
    active: false,
    t: 0,
    fromPos: new THREE.Vector3(),
    fromTarget: new THREE.Vector3(),
  });

  /* (re)start a flight whenever the framing destination changes */
  useEffect(() => {
    if (!rawControls) return;
    const f = flight.current;
    f.fromPos.copy(camera.position);
    f.fromTarget.copy(rawControls.target);
    f.t = 0;

    if (reduced) {
      camera.position.copy(dest.pos);
      rawControls.target.copy(dest.target);
      rawControls.update();
      f.active = false;
      return;
    }
    // Controls stay enabled on purpose: a drag during the flight cancels it
    // through the "start" listener below, so the visitor always wins.
    f.active = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dest, nonce, rawControls, reduced]);

  /* a user drag always wins over the animation */
  useEffect(() => {
    if (!rawControls) return;
    const cancel = () => {
      flight.current.active = false;
    };
    rawControls.addEventListener("start", cancel);
    return () => rawControls.removeEventListener("start", cancel);
  }, [rawControls]);

  useFrame((_, delta) => {
    const f = flight.current;
    if (!f.active || !rawControls) return;
    f.t = Math.min(1, f.t + delta / FLIGHT_SECONDS);
    const e = easeInOutCubic(f.t);
    camera.position.lerpVectors(f.fromPos, dest.pos, e);
    rawControls.target.lerpVectors(f.fromTarget, dest.target, e);
    rawControls.update();
    if (f.t >= 1) f.active = false;
  });

  return null;
}
