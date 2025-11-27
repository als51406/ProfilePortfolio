import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

type DetailViewProps = {
  modelUrl?: string;
  modelScale?: number; // additional multiplier (applied after fit)
  rotateSpeed?: number; // 라디안/초
  withLights?: boolean; // add basic lights in RT scene
  fit?: boolean;        // auto fit to target box
  fitBox?: number;      // target box size
  autoCenter?: boolean; // center to origin
} & ThreeElements['group'];

export default function DetailView({
  modelUrl = process.env.PUBLIC_URL + "/3d/person+3d+model.glb",
  modelScale = 1.3,
  rotateSpeed = 0.6,
  withLights = true,
  fit = true,
  fitBox = 2.5,
  autoCenter = true,
  ...groupProps
}: DetailViewProps) {
  const { scene } = useGLTF(modelUrl);
  const rootRef = useRef<THREE.Group>(null);
  const contentRef = useRef<THREE.Group>(null);

  // Prepare a centered/fit clone
  const prepared = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    if (!contentRef.current) return;
    // reset
    contentRef.current.position.set(0, 0, 0);
    contentRef.current.scale.setScalar(1);

    // compute bounds
    const box = new THREE.Box3().setFromObject(contentRef.current);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    if (autoCenter) {
      contentRef.current.position.sub(center); // move center to origin
    }

    if (fit) {
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const s = (fitBox / maxDim) * modelScale;
      contentRef.current.scale.setScalar(s);
    } else if (modelScale !== 1) {
      contentRef.current.scale.setScalar(modelScale);
    }
  }, [prepared, fit, fitBox, autoCenter, modelScale]);

  useFrame((_, delta) => {
    if (rootRef.current) rootRef.current.rotation.y += rotateSpeed * delta;
  });

  return (
    <group ref={rootRef} {...groupProps}>
      {withLights && (
        <>
          <ambientLight intensity={1.7} />
          <directionalLight position={[2, 2, 3]} intensity={1} />
        </>
      )}
      <group ref={contentRef}>
        <primitive object={prepared} />
      </group>
    </group>
  );
}