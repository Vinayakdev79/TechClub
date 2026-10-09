/**
 * Environment helpers: WebGL detection, capability tiers and local persistence.
 *
 * Persistence note: only non-sensitive demo preferences and locally saved ideas
 * are written to localStorage. Nothing is transmitted anywhere.
 */

/**
 * Persistence is handled by zustand/middleware under the key
 * `atc.campaign.v1` (see src/store/useClubStore.ts → partialize). Only
 * non-sensitive demo preferences and locally saved ideas are written there.
 */

/** Replace this file (or drop an image at /public/portrait.jpg) to swap the portrait. */
export const PORTRAIT_SRC: string | null = null;
export const PORTRAIT_PATH_HINT = "public/portrait.jpg";

export type Capability = "high" | "balanced" | "lite";

/** Detect WebGL support without creating a persistent context. */
export function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ??
      (canvas.getContext("webgl") as WebGLRenderingContext | null) ??
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return false;
    // Lose the probe context immediately so we do not hold a GPU slot.
    const ext = gl.getExtension("WEBGL_lose_context");
    ext?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

const isMobileUA = () =>
  typeof navigator !== "undefined" &&
  /Android|iPhone|iPad|iPod|Mobile|Silk/i.test(navigator.userAgent);

/**
 * Pick a starting capability tier. The user can always override it in the
 * header — this only avoids shipping heavy post-processing to weak devices.
 */
export function detectCapability(): Capability {
  if (typeof window === "undefined") return "balanced";
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 620;
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;

  if (isMobileUA() || (coarse && smallScreen) || cores <= 4 || (memory ?? 8) <= 4) {
    return cores <= 2 || (memory ?? 8) <= 2 ? "lite" : "balanced";
  }
  return "high";
}

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
