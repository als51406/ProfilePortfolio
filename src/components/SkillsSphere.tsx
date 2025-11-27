import React, { useRef, useState } from 'react'
import * as THREE from 'three';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Environment, Html } from '@react-three/drei';

//텍스쳐 import
import gsapTexture from '../assets/images/gsap.avif';
import tsTexture from '../assets/images/ts.png';
import threejsTexture from '../assets/images/threejs.png'
import reactTexture from '../assets/images/react.png'
import framerTexture from '../assets/images/framer.png'
import vscodeTexture from '../assets/images/vscode.png'
import html5Texture from '../assets/images/html5.png'


const SkillsSphere = () => {

    // 텍스처 배열 정의
    const textureUrls = [
      gsapTexture,
      tsTexture,
      threejsTexture,
        reactTexture,
        framerTexture,
        vscodeTexture,
        html5Texture,
        
      // 추가 텍스처들을 여기에 추가하세요
    ];

    // 각 텍스처에 매핑되는 외부 링크 (textureUrls와 인덱스 일치)
    const urls: string[] = [
      'https://greensock.com/gsap/',
      'https://www.typescriptlang.org/',
      'https://threejs.org/',
      'https://react.dev/',
      'https://www.framer.com/motion/',
      'https://code.visualstudio.com/',
      'https://developer.mozilla.org/docs/Web/HTML'
    ];

    // 각 텍스처에 매핑되는 라벨 텍스트
    const labels: string[] = [
      'GSAP',
      'TypeScript',
      'three.js',
      'React',
      'Framer Motion',
      'VSCode',
      'HTML5',
    ];

    // 여러 텍스처를 배열로 로드
    const textures = useLoader(THREE.TextureLoader, textureUrls);

    // overlay Canvas 내부에서 화면 픽셀 기준으로 렌더링
  const FixedSpheres: React.FC<{ textures: THREE.Texture[]; urls: string[] }> = ({ textures, urls }) => {
      const { size } = useThree();
      const meshRefs = useRef<THREE.Mesh[]>([]);
      const scaleTargets = useRef<number[]>([]);
      const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

      useFrame(() => {
        meshRefs.current.forEach((mesh, i) => {
          if (!mesh) return;
          // 회전
          mesh.rotation.y += 0.008 + i * 0.001;
          // 크기 보간 (hover 확대/복귀)
          const target = scaleTargets.current[i] ?? 1;
          const current = mesh.scale.x;
          const next = current + (target - current) * 0.18;
          mesh.scale.setScalar(next);
        });
      });

      const spacing = 112; // px 간격
      const radiusPx = 23; // px 반지름
      const y = -size.height / 2 + 110; // 하단에서 110px 위
      const startX = -((textures.length - 1) * spacing) / 2; // 중앙 정렬 시작점

      return (
        <group>
          {textures.map((texture, index) => (
            <mesh
              key={index}
              ref={(el) => {
                if (el) meshRefs.current[index] = el;
              }}
              position={[startX + index * spacing, y, 0]}
              onPointerOver={(e) => {
                e.stopPropagation();
                scaleTargets.current[index] = 1.35;
                (e.eventObject as any).userData.__hovered = true;
                setHoveredIndex(index);
                if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                scaleTargets.current[index] = 1;
                (e.eventObject as any).userData.__hovered = false;
                // pointer가 라벨 위로 이동할 때 사라지지 않도록 하고 싶다면 Html에 pointer-events:auto로 별도 처리 필요
                setHoveredIndex((prev) => (prev === index ? null : prev));
                if (typeof document !== 'undefined') document.body.style.cursor = '';
              }}
              onClick={(e) => {
                e.stopPropagation();
                const url = urls[index];
                if (url && typeof window !== 'undefined') {
                  const w = window.open(url, '_blank', 'noopener');
                  if (w) w.opener = null;
                }
              }}
            >
              <sphereGeometry args={[radiusPx, 64, 64]} />
              <meshStandardMaterial map={texture} metalness={0.1} roughness={0.2}  color="white" />
              {hoveredIndex === index && (
                <Html
                  center
                  position={[0, radiusPx + 16, 0]}
                  style={{
                    pointerEvents: 'none',
                    background: 'rgba(18,21,30,0.85)',
                    color: '#f4f6f8',
                    padding: '6px 10px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 0.3,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                    border: '1px solid rgba(255,255,255,0.14)'
                  }}
                >
                  {labels[index] ?? 'Skill'}
                </Html>
              )}
            </mesh>
          ))}
        </group>
      );
    };

    return (
      <Canvas
        orthographic
        camera={{ position: [0, 0, 100], zoom: 1 }}
        style={{ position: 'fixed', left: 0, right: 0, bottom: 0, width: '100vw', height: '260px', pointerEvents: 'auto', zIndex: 1100, background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
 
 
  <Environment preset="studio" />
  <FixedSpheres textures={textures as THREE.Texture[]} urls={urls} />
      </Canvas>
    )
}

export default SkillsSphere