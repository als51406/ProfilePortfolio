// ThreeDViewer.tsx
// Option B: 내부 HTML(Canvas) 클릭으로 바깥 카메라가 스크린 안으로 "줌인" 되는 전체 코드
// 설치: npm i three @react-three/fiber @react-three/drei gsap
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useLoader, useFrame, ThreeEvent } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

import MyElement3D from '../assets/MyElement3D';
import gsapTexture from '../assets/gsap.avif';
import tsTexture from '../assets/ts.png';
import threejsTexture from '../assets/threejs.png';
import reactTexture from '../assets/react.png';
import framerTexture from '../assets/framer.png';
import vscodeTexture from '../assets/vscode.png';
import html5Texture from '../assets/html5.png';

// ─────────────────────────────────────────────────────────────
// 마우스 움직임에 따라 카메라를 부드럽게 이동 (줌 중/줌 완료 시 비활성화)
// ─────────────────────────────────────────────────────────────
function CameraController({ disabled = false }: { disabled?: boolean }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 1, 0);
    if (disabled) return;

    const minX = -2.2, maxX = 2.2;
    const minY = 0, maxY = 1;

    const handleMouseMove = (e: MouseEvent) => {
      let x = (e.clientX / window.innerWidth - 0.5) * 10;
      let y = (0.5 - e.clientY / window.innerHeight) * 5;
      x = Math.max(minX, Math.min(maxX, x));
      y = Math.max(minY, Math.min(maxY, y));
      gsap.to(camera.position, {
        x,
        y,
        duration: 3,
        ease: 'power2.out',
        onUpdate: () => camera.lookAt(0, 1, 0),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [camera, disabled]);

  return null;
}

// ─────────────────────────────────────────────────────────────
// 줌 애니메이션을 실제 수행하는 컨트롤러 (Canvas 내부에서 camera 접근)
// register 핸들러를 통해 부모(ThreeDViewer)가 zoomIn/zoomOut 함수를 사용 가능하게 함
// ─────────────────────────────────────────────────────────────
function ZoomController({
  screen1Ref,
  onState,
  register,
}: {
  screen1Ref: React.RefObject<THREE.Mesh>;
  onState: React.MutableRefObject<{ isZooming: boolean; isZoomed: boolean }>;
  register: (fns: { zoomIn: () => void; zoomOut: () => void }) => void;
}) {
  const { camera } = useThree();

  // 중앙 스크린으로 줌인
  const zoomIn = () => {
    if (onState.current.isZooming || onState.current.isZoomed) return;
    const targetMesh = screen1Ref.current;
    if (!targetMesh) return;

    const worldPos = new THREE.Vector3();
    const worldQuat = new THREE.Quaternion();
    targetMesh.getWorldPosition(worldPos);
    targetMesh.getWorldQuaternion(worldQuat);
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(worldQuat).normalize();

    const cam = camera as THREE.PerspectiveCamera;
    const toPos = worldPos.clone().addScaledVector(normal, 0.55); // 스크린 앞 0.55m
    const toFov = 28;

    onState.current.isZooming = true;

    gsap.to(cam.position, {
      x: toPos.x, y: toPos.y, z: toPos.z,
      duration: 1.2, ease: 'power3.out',
      onUpdate: () => { cam.lookAt(worldPos); cam.updateProjectionMatrix(); },
    });
    gsap.to(cam, {
      fov: toFov,
      duration: 1.2,
      ease: 'power3.out',
      onUpdate: () => cam.updateProjectionMatrix(),
      onComplete: () => {
        onState.current.isZooming = false;
        onState.current.isZoomed = true;
      },
    });
  };

  // 원위치로 줌아웃
  const zoomOut = () => {
    if (onState.current.isZooming || !onState.current.isZoomed) return;
    const cam = camera as THREE.PerspectiveCamera;

    onState.current.isZooming = true;

    gsap.to(cam.position, {
      x: 0, y: 0, z: 20,
      duration: 1.0, ease: 'power3.out',
      onUpdate: () => { cam.lookAt(0, 1, 0); cam.updateProjectionMatrix(); },
    });
    gsap.to(cam, {
      fov: 32,
      duration: 1.0,
      ease: 'power3.out',
      onUpdate: () => cam.updateProjectionMatrix(),
      onComplete: () => {
        onState.current.isZooming = false;
        onState.current.isZoomed = false;
      },
    });
  };

  // ESC로 줌아웃
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') zoomOut(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // 부모에 핸들러 등록
  useEffect(() => {
    register({ zoomIn, zoomOut });
  }, []); // 최초 1회 등록

  return null;
}

// ─────────────────────────────────────────────────────────────
// 3D 씬 메인 모델 (중앙 스크린 Html 내부 Canvas 클릭 → 부모가 넘겨준 onZoomIn 호출)
// ─────────────────────────────────────────────────────────────
interface ModelProps {
  onZoomIn: () => void;           // 내부 Canvas(HTML) 클릭 시 호출
  onZoomOutBG: () => void;        // 줌 상태에서 다른 오브젝트 클릭 시 줌아웃
  isZoomed: boolean;              // HUD 등 UI 토글용
  screen1Ref: React.RefObject<THREE.Mesh>;
  onColorChange: (index: number) => void;
}

function Model({ onZoomIn, onZoomOutBG, isZoomed, screen1Ref, onColorChange }: ModelProps) {
  const gltf = useGLTF(process.env.PUBLIC_URL + '/3d/studio_30.glb');

  // 텍스처 로드
  const textureUrls = [
    gsapTexture,
    tsTexture,
    threejsTexture,
    reactTexture,
    framerTexture,
    vscodeTexture,
    html5Texture,
  ];
  const textures = useLoader(THREE.TextureLoader, textureUrls);

  // 아이콘 구체 자동 회전
  const meshRefs = useRef<THREE.Mesh[]>([]);
  useFrame(() => {
    meshRefs.current.forEach((mesh, index) => {
      if (mesh) mesh.rotation.y += 0.008 + index * 0.005;
    });
  });

  // 줌 상태일 때 구체/다른 스크린 클릭 → 줌아웃
  const handleBGClick = (e: ThreeEvent<MouseEvent>) => {
    if (!isZoomed) return;
    e.stopPropagation();
    onZoomOutBG();
  };

  return (
    <>
      <primitive object={gltf.scene} scale={[3, 3, 3]} rotation={[0, 0, 0]} position={[0, -2, 0]} />

      {/* 텍스처 구체들 */}
      {textures.map((texture, index) => (
        <mesh
          key={index}
          ref={(el) => { if (el) meshRefs.current[index] = el; }}
          position={[(index - 3) * 1, -1.5, 10]}
          onClick={handleBGClick}
        >
          <sphereGeometry args={[0.2, 64, 64]} />
          <meshStandardMaterial map={texture} metalness={0} roughness={0.1} color="white" />
        </mesh>
      ))}

      {/* HUD 텍스트 (DOM위에 떠 있지만 클릭 방해 없도록 pointerEvents: 'none') */}
      <mesh position={[0, 3.5, 5]}>
        <Html
          center
          style={{
            pointerEvents: 'none',
            zIndex: 1000,
            position: 'fixed',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '400vh',
              color: '#efefef',
              fontSize: 260,
              fontWeight: 100,
              padding: 8,
              textAlign: 'center',
              marginTop: '150px',
              lineHeight: '200px',
              opacity: isZoomed ? 0 : 1,
              transition: 'opacity 0.5s ease',
            }}
          >
            <p>FRONT-END</p>
            <p>DEVELOPER</p>
          </div>
        </Html>
      </mesh>

      {/* 스크린 프레임1 (중앙) ─ 내부 HTML(Canvas) 클릭으로 줌인 */}
      <mesh position={[0, 1.5, 1]} ref={screen1Ref}>
        <boxGeometry args={[2, 1.2, 0.1]} />
        <meshStandardMaterial color="#222" />

        <Html
          transform
          position={[0, 0, 0.055]}
          distanceFactor={1.2}
          style={{
            borderRadius: 8,
            overflow: 'hidden',
            width: 2560,
            height: 1440,
            background: 'black',
          }}
        >
          {/* 내부 DOM 클릭을 그대로 받아서 onZoomIn 호출 */}
          <div onClick={onZoomIn} style={{ width: '100%', height: '100%' }}>
            <Canvas
              className="screen-1"
              style={{ width: '310vw', height: '300vh' }}
              camera={{ fov: 65, position: [0, 1, 6] }}
            >
              <MyElement3D />
            </Canvas>
          </div>
        </Html>
      </mesh>

      {/* 스크린 프레임2 */}
      <mesh position={[7, 1, -0.5]} onClick={handleBGClick}>
        <boxGeometry args={[2, 1.2, 0.1]} />
        <meshStandardMaterial color="#222" />
        <Html
          transform
          position={[0, 0, 0.055]}
          distanceFactor={1.2}
          style={{ borderRadius: 8, overflow: 'hidden', width: 1280, height: 720, background: 'black' }}
        >
          <img src="./images/ss.png" width={1280} height={720} style={{ border: '0' }} />
        </Html>
      </mesh>

      {/* 스크린 프레임3 */}
      <mesh position={[-7, 1, -0.5]} onClick={handleBGClick}>
        <boxGeometry args={[2, 1.2, 0.1]} />
        <meshStandardMaterial color="#222" />
        <Html
          transform
          position={[0, 0, 0.055]}
          distanceFactor={1.2}
          style={{ borderRadius: 8, overflow: 'hidden', width: 1280, height: 720, background: 'black' }}
        >
          <img src="./images/ss.png" width={1280} height={720} style={{ border: '0' }} />
        </Html>
      </mesh>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 최상위 뷰어: 상태/핸들러 조립
// ─────────────────────────────────────────────────────────────
const ThreeDViewer: React.FC = () => {
  const [filterValue, setFilterValue] = useState<string>('hue-rotate(0deg)'); // (현재 코드는 미사용)
  const [_, forceRerender] = useState(0); // 필요 시 강제 갱신용

  // 줌 상태를 ref로 보관 (Canvas 내부/외부에서 공유)
  const zoomStateRef = useRef({ isZooming: false, isZoomed: false });

  // CameraController 비활성화 여부
  const cameraDisabled = zoomStateRef.current.isZooming || zoomStateRef.current.isZoomed;

  // 중앙 스크린 메쉬 ref (ZoomController가 접근)
  const screen1Ref = useRef<THREE.Mesh>(null!);

  // ZoomController가 부모에 등록할 핸들러 저장
  const zoomFnsRef = useRef<{ zoomIn: () => void; zoomOut: () => void }>({
    zoomIn: () => {},
    zoomOut: () => {},
  });

  // 색상 변경(필터) — 필요 시 사용
  const handleColorChange = (index: number): void => {
    const hueValues: string[] = [
      'hue-rotate(0deg)',
      'hue-rotate(120deg) saturate(0.5)',
      'hue-rotate(240deg) saturate(0.5)',
    ];
    setFilterValue(hueValues[index]);
  };

  return (
    <div className="three-d-viewer-wrapper">
      <Canvas style={{ width: '100%', height: '100vh' }} camera={{ fov: 32 }}>
        <ambientLight />

        {/* 마우스 추적: 줌 중/완료 시 비활성화 */}
        <CameraController disabled={cameraDisabled} />

        {/* 카메라 줌 컨트롤러 (Canvas 내부 카메라 접근) */}
        <ZoomController
          screen1Ref={screen1Ref}
          onState={zoomStateRef}
          register={(fns) => { zoomFnsRef.current = fns; }}
        />

        <Suspense fallback={null}>
          <Model
            onZoomIn={() => {
              zoomFnsRef.current.zoomIn();
              // 상태 변화 반영 위해 강제 리렌더 (HUD opacity 등)
              setTimeout(() => forceRerender((n) => n + 1), 0);
            }}
            onZoomOutBG={() => {
              zoomFnsRef.current.zoomOut();
              setTimeout(() => forceRerender((n) => n + 1), 0);
            }}
            isZoomed={zoomStateRef.current.isZoomed}
            screen1Ref={screen1Ref}
            onColorChange={handleColorChange}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeDViewer;
