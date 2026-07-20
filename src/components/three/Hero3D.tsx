"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { brand } from "@/lib/brand";
import { makeHaaTexture } from "./haaTexture";

/**
 * MEANING: a brass maker's seal embossed with ح — the brand's stamp.
 * Interaction: slow self-rotation + leans toward the cursor (inspecting a
 * coin) + scroll reveals its edge/depth + scales up on hover.
 */
function Seal() {
  const group = useRef<THREE.Group>(null);
  const hovered = useRef(false);
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

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const scroll =
      typeof window !== "undefined"
        ? Math.min(1, window.scrollY / (window.innerHeight || 1))
        : 0;
    // Lean toward cursor; scroll turns the seal to catch its edge.
    g.rotation.y = THREE.MathUtils.lerp(
      g.rotation.y,
      state.pointer.x * 0.5 + scroll * Math.PI * 0.9,
      0.05,
    );
    g.rotation.x = THREE.MathUtils.lerp(
      g.rotation.x,
      -state.pointer.y * 0.4 + scroll * 0.3,
      0.05,
    );
    const target = hovered.current ? 1.12 : 1;
    g.scale.lerp(new THREE.Vector3(target, target, target), 0.08);
    void delta;
  });

  return (
    <Float speed={1} rotationIntensity={0.15} floatIntensity={0.5}>
      <group
        ref={group}
        scale={1.3}
        onPointerOver={() => (hovered.current = true)}
        onPointerOut={() => (hovered.current = false)}
      >
        {/* coin body — face (with ح) points toward camera */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.4, 1.4, 0.18, 80]} />
          <meshStandardMaterial
            attach="material-0"
            color={brand.colors.brass.deep}
            metalness={1}
            roughness={0.38}
            envMapIntensity={0.9}
          />
          <meshStandardMaterial
            attach="material-1"
            map={haa ?? undefined}
            bumpMap={haa ?? undefined}
            bumpScale={-0.05}
            color={haa ? "#ffffff" : brand.colors.brass.base}
            metalness={1}
            roughness={0.42}
            envMapIntensity={0.9}
          />
          <meshStandardMaterial
            attach="material-2"
            color={brand.colors.brass.deep}
            metalness={1}
            roughness={0.42}
          />
        </mesh>
        {/* raised rim */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <torusGeometry args={[1.4, 0.06, 20, 90]} />
          <meshStandardMaterial
            color={brand.colors.brass.hi}
            metalness={1}
            roughness={0.25}
            envMapIntensity={1.1}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function Hero3D({
  quality = "high",
}: {
  quality?: "high" | "mid";
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 42 }}
      dpr={quality === "high" ? [1, 2] : [1, 1.4]}
      gl={{ antialias: true }}
      style={{ background: brand.colors.ink[900] }}
    >
      <ambientLight intensity={0.25} />
      <spotLight
        position={[6, 7, 5]}
        angle={0.5}
        penumbra={1}
        intensity={40}
        color={brand.colors.brass.hi}
      />
      <directionalLight
        position={[-5, -2, -4]}
        intensity={0.4}
        color={brand.colors.oxblood.tint}
      />
      <Seal />
      <Environment preset="studio" environmentIntensity={0.7} />
      {quality === "high" && (
        <EffectComposer>
          <Bloom
            intensity={0.6}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.3}
            mipmapBlur
          />
          <Vignette offset={0.22} darkness={0.92} eskil={false} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
