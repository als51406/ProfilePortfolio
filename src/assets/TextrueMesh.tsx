import React, { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

type Props = {
  // Image source (prefer import or process.env.PUBLIC_URL based path)
  src: string;
  // Plane size in world units; if only width is provided, height is derived by image aspect
  width?: number; // default 2 (MeshCarousel3D default panelW)
  height?: number; // overrides auto aspect if provided
  position?: [number, number, number];
  transparent?: boolean;
  opacity?: number; // default 1
  doubleSided?: boolean; // default false
  flipY?: boolean; // default undefined (leave as loader default)
  toneMapped?: boolean; // default false to keep colors as-is inside RT
};

const TextrueMesh: React.FC<Props> = ({
  src,
  width = 2,
  height,
  position = [0, 0, 0],
  transparent = false,
  opacity = 1,
  doubleSided = false,
  flipY,
  toneMapped = false,
}) => {
  const { gl } = useThree();
  const texture = useTexture(src) as THREE.Texture;

  // Configure texture once loaded
  useMemo(() => {
    if (!texture) return;
    // Preserve original colors - THREE.SRGBColorSpace is available in r152+
    texture.colorSpace = THREE.SRGBColorSpace;
    if (typeof flipY === 'boolean') texture.flipY = flipY;
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    texture.anisotropy = Math.max(texture.anisotropy ?? 1, maxAniso);
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
  }, [texture, gl, flipY]);

  // Compute height from image aspect if not provided
  const { w, h } = useMemo(() => {
    const img = (texture && (texture.image as HTMLImageElement)) || undefined;
    const aspect = img?.width && img?.height ? img.width / img.height : 16 / 9;
    const finalH = typeof height === 'number' ? height : width / aspect;
    return { w: width, h: finalH };
  }, [texture, width, height]);

  return (
    <mesh position={position}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        map={texture}
        transparent={transparent}
        opacity={opacity}
        toneMapped={toneMapped}
        side={doubleSided ? THREE.DoubleSide : THREE.FrontSide}
      />
    </mesh>
  );
};

export default TextrueMesh;