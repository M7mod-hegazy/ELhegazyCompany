"use client";

import { Environment, Float, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";
import { brand } from "@/lib/brand";

/** MEANING: floating ad/reel creative cards (one with a play glyph) — the
 *  content this service produces. Scroll tilts the cluster; cursor leans it;
 *  hover lifts it. */
function CreativeCard({
  position,
  rot = [0, 0, 0],
  play = false,
  small = false,
}: {
  position: [number, number, number];
  rot?: [number, number, number];
  play?: boolean;
  small?: boolean;
}) {
  const w = small ? 0.9 : 1.3;
  const h = small ? 1.2 : 0.95;
  return (
    <group position={position} rotation={rot}>
      <RoundedBox args={[w, h, 0.06]} radius={0.08} smoothness={4}>
        <meshStandardMaterial
          color={brand.colors.brass.base}
          metalness={0.85}
          roughness={0.32}
          envMapIntensity={0.7}
        />
      </RoundedBox>
      <mesh position={[0, h / 2 - 0.14, 0.035]}>
        <planeGeometry args={[w - 0.16, 0.14]} />
        <meshStandardMaterial color={brand.colors.ink[900]} roughness={0.6} />
      </mesh>
      {play && (
        <mesh position={[0, 0, 0.045]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.16, 0.28, 3]} />
          <meshStandardMaterial color={brand.colors.ink[900]} roughness={0.6} />
        </mesh>
      )}
    </group>
  );
}

function Cards({ progress }: { progress?: RefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  const hovered = useRef(false);
  useFrame((state, delta) => {
    const grp = g.current;
    if (!grp) return;
    const p = progress?.current ?? 0;
    grp.rotation.y += delta * 0.12;
    grp.rotation.x = THREE.MathUtils.lerp(
      grp.rotation.x,
      state.pointer.y * 0.25 + (p - 0.5) * 0.7,
      0.05,
    );
    grp.rotation.z = THREE.MathUtils.lerp(grp.rotation.z, -state.pointer.x * 0.15, 0.05);
    const t = hovered.current ? 1.1 : 1;
    grp.scale.lerp(new THREE.Vector3(t, t, t), 0.08);
  });
  return (
    <group
      ref={g}
      onPointerOver={() => (hovered.current = true)}
      onPointerOut={() => (hovered.current = false)}
    >
      <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.7}>
        <CreativeCard position={[-1.3, 0.5, 0]} rot={[0, 0.3, 0.1]} />
      </Float>
      <Float speed={1.1} rotationIntensity={0.3} floatIntensity={0.9}>
        <CreativeCard position={[1.2, -0.3, -0.4]} rot={[0, -0.4, -0.08]} play />
      </Float>
      <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.6}>
        <CreativeCard position={[0.1, 1.0, 0.4]} rot={[0, 0.1, 0.05]} small />
      </Float>
    </group>
  );
}

export default function MarketingScene({
  progress,
}: {
  progress?: RefObject<number>;
}) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <spotLight
        position={[5, 6, 5]}
        angle={0.5}
        penumbra={1}
        intensity={35}
        color={brand.colors.brass.hi}
      />
      <Cards progress={progress} />
      <Environment preset="studio" environmentIntensity={0.6} />
    </>
  );
}
