"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { brand } from "@/lib/brand";
import { pointer } from "@/lib/scrollSections";
import { sampleGlyphPoints } from "./sampleGlyph";

/**
 * Revolutionary hero: thousands of brass particles that swirl in a scattered
 * cloud, magnetize toward the cursor, and assemble into the الحجازي wordmark.
 * SCROLL through the hero explodes them apart (then the next section's object
 * takes over).
 */
export function ParticleField({ count = 7000 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const [homes, setHomes] = useState<Float32Array | null>(null);

  useEffect(() => {
    // Sample immediately (renders in any Arabic-capable font), then refine
    // once the brand font is ready.
    setHomes(sampleGlyphPoints("الحجازي", count, 6.4));
    let mounted = true;
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    fonts?.ready?.then(() => {
      if (mounted) setHomes(sampleGlyphPoints("الحجازي", count, 6.4));
    });
    return () => {
      mounted = false;
    };
  }, [count]);

  const { positions, scatter, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scatter = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 3.5;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const sx = r * Math.sin(ph) * Math.cos(th);
      const sy = r * Math.sin(ph) * Math.sin(th);
      const sz = r * Math.cos(ph) * 0.5;
      scatter[i * 3] = sx;
      scatter[i * 3 + 1] = sy;
      scatter[i * 3 + 2] = sz;
      positions[i * 3] = sx;
      positions[i * 3 + 1] = sy;
      positions[i * 3 + 2] = sz;
      seeds[i] = Math.random();
    }
    return { positions, scatter, seeds };
  }, [count]);

  useFrame((state) => {
    const pts = ref.current;
    if (!pts) return;
    // Fully formed at the very top (scrollY 0); explodes as you scroll the hero.
    const sy = typeof window !== "undefined" ? window.scrollY : 0;
    const vh = typeof window !== "undefined" ? window.innerHeight : 1;
    const formed = THREE.MathUtils.clamp(1 - sy / (vh * 0.85), 0, 1);
    const t = state.clock.elapsedTime;
    const cx = pointer.x * 3.4;
    const cy = pointer.y * 2.2;
    const arr = (pts.geometry.attributes.position as THREE.BufferAttribute)
      .array as Float32Array;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const sx = scatter[ix];
      const sy = scatter[ix + 1];
      const sz = scatter[ix + 2];
      const hx = homes ? homes[ix] : sx;
      const hy = homes ? homes[ix + 1] : sy;
      const hz = homes ? homes[ix + 2] : sz;
      const seed = seeds[i];

      let tx = sx + (hx - sx) * formed;
      let ty = sy + (hy - sy) * formed;
      const tz = sz + (hz - sz) * formed;

      // idle shimmer when formed; drifting swirl when scattered
      tx += Math.sin(t * 0.5 + seed * 12) * (0.04 * formed + 0.12 * (1 - formed));
      ty += Math.cos(t * 0.5 + seed * 12) * (0.04 * formed + 0.12 * (1 - formed));

      // cursor magnetism — pull nearby particles toward the cursor
      const dx = cx - arr[ix];
      const dy = cy - arr[ix + 1];
      const d2 = dx * dx + dy * dy;
      if (d2 < 1.6) {
        const f = (1.6 - d2) * 0.07;
        tx += dx * f;
        ty += dy * f;
      }

      arr[ix] += (tx - arr[ix]) * 0.08;
      arr[ix + 1] += (ty - arr[ix + 1]) * 0.08;
      arr[ix + 2] += (tz - arr[ix + 2]) * 0.08;
    }
    (pts.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    pts.rotation.y = Math.sin(t * 0.12) * 0.12;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={brand.colors.brass.hi}
        sizeAttenuation
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
