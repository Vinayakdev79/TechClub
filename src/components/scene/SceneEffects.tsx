import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useClubStore } from "@/store/useClubStore";

/**
 * Controlled bloom. Loaded through React.lazy so that devices on the "lite"
 * tier never evaluate the post-processing stack at all.
 */
export default function SceneEffects() {
  const capability = useClubStore((s) => s.capability);
  const reduced = useClubStore((s) => s.reducedMotion);

  if (capability === "lite" || reduced) return null;

  return (
    <EffectComposer multisampling={capability === "high" ? 2 : 0} enableNormalPass={false}>
      <Bloom
        intensity={capability === "high" ? 0.7 : 0.5}
        luminanceThreshold={0.34}
        luminanceSmoothing={0.75}
        mipmapBlur
        radius={0.7}
      />
      <Vignette eskil={false} offset={0.24} darkness={0.82} />
    </EffectComposer>
  );
}
