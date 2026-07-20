"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { brand } from "@/lib/brand";
import { makeHaaTexture } from "./haaTexture";

/** The brass maker's seal embossed with ح — the hero anchor object.
 *  Lights/environment are provided by the parent stage. */
export function Seal() {
  const [haa, setHaa] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let mounted = true;
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    (fonts?.ready ?? Promise.resolve()).then(() => {
      if (mounted) setHaa(makeHaaTexture());
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <group scale={1.25}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.4, 1.4, 0.18, 80]} />
        <meshStandardMaterial
          attach="material-0"
          color={brand.colors.brass.deep}
          metalness={1}
          roughness={0.38}
          envMapIntensity={1}
        />
        <meshStandardMaterial
          attach="material-1"
          map={haa ?? undefined}
          bumpMap={haa ?? undefined}
          bumpScale={-0.05}
          color={haa ? "#ffffff" : brand.colors.brass.base}
          metalness={1}
          roughness={0.42}
          envMapIntensity={1}
        />
        <meshStandardMaterial
          attach="material-2"
          color={brand.colors.brass.deep}
          metalness={1}
          roughness={0.42}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.4, 0.06, 20, 90]} />
        <meshStandardMaterial
          color={brand.colors.brass.hi}
          metalness={1}
          roughness={0.25}
          envMapIntensity={1.2}
        />
      </mesh>
    </group>
  );
}
