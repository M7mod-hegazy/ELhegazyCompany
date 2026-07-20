"use client";

import { Environment, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";
import { brand } from "@/lib/brand";

/** MEANING: a brass shipping parcel with a taped band — orders & delivery
 *  from the online store. Scroll turns it; cursor tilts it; hover scales. */
function Parcel({ progress }: { progress?: RefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  const hovered = useRef(false);
  useFrame((state, delta) => {
    const grp = g.current;
    if (!grp) return;
    const p = progress?.current ?? 0;
    grp.rotation.y += delta * 0.3;
    grp.rotation.x = THREE.MathUtils.lerp(
      grp.rotation.x,
      state.pointer.y * 0.3 + (p - 0.5) * 0.5 + 0.2,
      0.05,
    );
    grp.rotation.z = THREE.MathUtils.lerp(grp.rotation.z, state.pointer.x * 0.12, 0.05);
    const t = hovered.current ? 1.12 : 1;
    grp.scale.lerp(new THREE.Vector3(t, t, t), 0.08);
  });
  return (
    <group
      ref={g}
      scale={1.1}
      onPointerOver={() => (hovered.current = true)}
      onPointerOut={() => (hovered.current = false)}
    >
      <RoundedBox args={[1.5, 1.5, 1.5]} radius={0.08} smoothness={4}>
        <meshStandardMaterial
          color={brand.colors.brass.base}
          metalness={0.9}
          roughness={0.36}
          envMapIntensity={0.7}
        />
      </RoundedBox>
      {/* taped bands */}
      <mesh>
        <boxGeometry args={[1.54, 0.26, 1.54]} />
        <meshStandardMaterial
          color={brand.colors.brass.deep}
          metalness={0.85}
          roughness={0.4}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[1.54, 0.26, 1.54]} />
        <meshStandardMaterial
          color={brand.colors.brass.deep}
          metalness={0.85}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

export default function EcommerceScene({
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
      <Parcel progress={progress} />
      <Environment preset="studio" environmentIntensity={0.6} />
    </>
  );
}
