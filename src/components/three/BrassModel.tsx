"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { brand } from "@/lib/brand";

/**
 * Loads a glTF and recasts it entirely in brass (keeping the original normal
 * maps for fine surface detail), centered and normalized to `targetSize` so
 * every section's object reads at a consistent scale.
 */
export function BrassModel({
  url,
  targetSize = 2.6,
}: {
  url: string;
  targetSize?: number;
}) {
  const { scene } = useGLTF(url);

  const { object, scale } = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!(mesh as unknown as { isMesh?: boolean }).isMesh) return;
      const old = mesh.material as THREE.MeshStandardMaterial;
      mesh.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(brand.colors.brass.base),
        metalness: 1,
        roughness: 0.34,
        normalMap: old?.normalMap ?? null,
        envMapIntensity: 1.15,
      });
      mesh.castShadow = false;
      mesh.receiveShadow = false;
    });

    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    clone.position.set(-center.x, -center.y, -center.z);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return { object: clone, scale: targetSize / maxDim };
  }, [scene, targetSize]);

  return (
    <group scale={scale}>
      <primitive object={object} />
    </group>
  );
}

useGLTF.preload("/models/Camera_01.glb");
useGLTF.preload("/models/CashRegister_01.glb");
useGLTF.preload("/models/classic_laptop.glb");
