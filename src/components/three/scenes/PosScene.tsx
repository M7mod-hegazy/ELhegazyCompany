"use client";

import { Environment, Float, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";
import { brand } from "@/lib/brand";

/** MEANING: the POS app itself — floating UI screens with a brass header bar
 *  and list rows (a point-of-sale list). Scroll lifts/turns them; cursor
 *  steers; hover scales. */
function Screen({
  position,
  main = false,
}: {
  position: [number, number, number];
  main?: boolean;
}) {
  const w = main ? 2 : 1.1;
  const h = main ? 1.3 : 0.82;
  return (
    <group position={position}>
      <RoundedBox args={[w, h, 0.06]} radius={0.06} smoothness={4}>
        <meshStandardMaterial
          color={brand.colors.ink[700]}
          metalness={0.6}
          roughness={0.35}
          envMapIntensity={0.6}
        />
      </RoundedBox>
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[w - 0.12, h - 0.12]} />
        <meshStandardMaterial color="#16161a" roughness={0.7} />
      </mesh>
      <mesh position={[0, h / 2 - 0.18, 0.04]}>
        <planeGeometry args={[w - 0.12, 0.16]} />
        <meshStandardMaterial
          color={brand.colors.brass.base}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.12 - i * 0.26, 0.04]}>
          <planeGeometry args={[w - 0.4, 0.06]} />
          <meshStandardMaterial
            color={brand.colors.brass.deep}
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

function Screens({ progress }: { progress?: RefObject<number> }) {
  const g = useRef<THREE.Group>(null);
  const hovered = useRef(false);
  useFrame((state, delta) => {
    const grp = g.current;
    if (!grp) return;
    const p = progress?.current ?? 0;
    grp.rotation.y = THREE.MathUtils.lerp(
      grp.rotation.y,
      state.pointer.x * 0.4 + (p - 0.5) * 0.5,
      0.05,
    );
    grp.rotation.x = THREE.MathUtils.lerp(
      grp.rotation.x,
      -state.pointer.y * 0.2 + 0.05,
      0.05,
    );
    grp.position.y = THREE.MathUtils.lerp(grp.position.y, (p - 0.5) * 0.4, 0.05);
    const t = hovered.current ? 1.08 : 1;
    grp.scale.lerp(new THREE.Vector3(t, t, t), 0.08);
    void delta;
  });
  return (
    <group
      ref={g}
      onPointerOver={() => (hovered.current = true)}
      onPointerOut={() => (hovered.current = false)}
    >
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        <Screen position={[-0.3, 0, 0]} main />
      </Float>
      <Float speed={1.3} rotationIntensity={0.2} floatIntensity={0.7}>
        <Screen position={[1.2, -0.5, 0.5]} />
      </Float>
    </group>
  );
}

export default function PosScene({
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
      <Screens progress={progress} />
      <Environment preset="studio" environmentIntensity={0.6} />
    </>
  );
}
