import React, { Suspense, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Canvas } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import MyElement3D from '../assets/MyElement3D';
import MeshCarousel3D, { MeshCarousel3DHandle } from './MeshCarousel3D';
import Detailview from '../assets/Detailview';
import TextrueMesh from '../assets/TextrueMesh';
import promo from '../assets/images/프로모션.png';

// 3D 모델 사전 로딩 - 초기 렌더링 성능 향상
useGLTF.preload(process.env.PUBLIC_URL + '/3d/studio_30.glb');
useGLTF.preload(process.env.PUBLIC_URL + '/3d/apple_watch_ultra_2.glb');
useGLTF.preload('./models/apple_watch_ultra_2.glb');

// 마우스 움직임에 따른 카메라 무빙
function CameraController() {
  const { camera } = useThree();

  useEffect(() => {
        // Front-facing camera: z-forward with subtle x/y parallax
        camera.position.set(0, 0, 20);
        camera.lookAt(0, 1, 0);
    const minX = -2.2, maxX = 2.2;
    const minY = -1, maxY = 1;
    const handleMouseMove = (e: MouseEvent) => {
      let x = (e.clientX / window.innerWidth - 0.5) * 10;
      let y = (0.5 - e.clientY / window.innerHeight) * 5;
      x = Math.max(minX, Math.min(maxX, x));
      y = Math.max(minY, Math.min(maxY, y));
      gsap.to(camera.position, {
        x,
        y,
        duration: 5,
        ease: 'power2.out',
        onUpdate: () => camera.lookAt(0, 1, 0)
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [camera]);
  return null;
}

//props 타입 선언
interface ModelProps {
  carouselRef?: React.Ref<MeshCarousel3DHandle>;
}
//3D 오브젝트 컨텐츠
function Model({ carouselRef }: ModelProps) {
    const gltf = useGLTF(process.env.PUBLIC_URL + '/3d/studio_30.glb');
    
    
    
  return (
    <>
      {/* 배경 */}
      <primitive
        object={gltf.scene}
        scale={[3, 3, 3]}
        rotation={[0, 0, 0]}
        position={[0, -2, 0]}
      />


      {/* 텍스트를 띄우기 (3D 공간 내에 위치) */}
      <mesh position={[0, 3.6, 5]}>
        <Html center style={{  pointerEvents: 'none',
                                zIndex: 1000, // 매우 높은 값
                                position: 'fixed',display:"flex", justifyContent:"ceneter", alignItems:"center" }}>
          <div style={{
            width:"400vh",
            color: '#efefef',
            fontSize: 195,
            fontWeight: 100,
            padding: 8,
            textAlign:"center",
            marginTop:"150px",
            lineHeight:"175px"
          }}>
            <p>FRONT-END</p>
            <p>DEVELOPER</p>
          </div>
        </Html>
      </mesh>

      {/* 메쉬 기반 3D 무한 캐러셀 (3패널) */}
        <MeshCarousel3D
        ref={carouselRef as any}
        count={3}
        radius={9}
        y={1.5}
        panelW={2}
        panelH={1.2}
        sensitivity={0.007}
        focusScale={1.8}
        inertia
        snap
        facing="camera"
        enableDrag={false}
        onPanelClick={(i) => {
          const urls = [
            'https://developer.apple.com',
            'https://www.behance.net/gallery/235329275/_',
            'https://github.com',
          ];
          const url = urls[i] ?? urls[0];
          window.open(url, '_blank', 'noopener,noreferrer');
        }}
  // 중앙 RenderTexture 해상도 및 비율 고정 (720x400)
  rtWidth={540}
  rtHeight={300}
  rtSamples={0}
  rtAnisotropy={12}
  lockPanelToRTAspect
        positions={[
          [0, 1.5, 1],
          [7, 1, -0.5],
          [-7, 1, -0.5],
        ]}
        rtContent={(i) => {
          if (i === 0) {
            return (
              <>
                {/* 개별 배경색도 가능: */}
                <color attach="background" args={["#101010"]} />
                <Detailview modelUrl={process.env.PUBLIC_URL + '/3d/apple_watch_ultra_2.glb'} fitBox={2.8} rotateSpeed={0.7} />
              </>
            );
          }
          if (i === 1) {
            return (
              <>
                {/* 배경색 유지 또는 조정 가능 */}
                <color attach="background" args={["#0b0b0b"]} />
                {/* 이미지 비율에 맞게 높이 자동 계산 */}
                <TextrueMesh src={promo} width={2} toneMapped={false} />
              </>
            );
          }
          // i === 2: MyElement3D 예시
          return (
            <>
              <color attach="background" args={["#121212ff"]} />
              <group scale={[0.5, 0.5, 0.5]}>
                <MyElement3D />
              </group>
            </>
          );
        }}
      />


    </>
  );
}

const ThreeDViewer: React.FC = () => {
  const carouselRef = useRef<MeshCarousel3DHandle>(null);

  const ButtonsPortal: React.FC = () =>
    createPortal(
      <>
        <button
          aria-label="이전 슬라이드로 이동"
          style={{
            fontSize: '16px',
            position: 'fixed',
            left: '40%',
            top: '70%',
            transform: 'translateY(-50%) scale(1)',
            zIndex: 5000,
            pointerEvents: 'auto',
            width: 60,
            height: 60,
            padding: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(74, 74, 74, 0.5)',
            border: '1px solid rgba(255,255,255,0.35)',
            backdropFilter: 'blur(14px) saturate(160%)',
            WebkitBackdropFilter: 'blur(14px) saturate(160%)',
            boxShadow: '0 4px 18px -4px rgba(0,0,0,0.4), inset 0 0 0 0.5px rgba(255,255,255,0.3)',
            color: '#E4E9EC',
            letterSpacing: '1px',
            fontWeight: 500,
            outline: 'none',
            borderStyle: 'solid',
            transition: 'color .4s ease, transform .5s cubic-bezier(.22,.61,.36,1), background .4s ease, box-shadow .5s',
            willChange: 'transform'
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transition = 'color .35s ease, transform .5s cubic-bezier(.22,.61,.36,1), background .35s ease, box-shadow .45s';
            el.style.color = '#C8FF7A';
            el.style.transform = 'translateY(-50%) scale(1.12)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transition = 'color .35s ease, transform .5s cubic-bezier(.22,.61,.36,1), background .35s ease, box-shadow .45s';
            el.style.color = '#E4E9EC';
            el.style.transform = 'translateY(-50%) scale(1)';
          }}
          onMouseDown={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transition = 'transform .12s ease, background .2s ease, box-shadow .2s';
            el.style.transform = 'translateY(-50%) scale(0.95)';
            el.style.boxShadow = '0 2px 10px -2px rgba(0,0,0,0.5), inset 0 0 0 0.5px rgba(255,255,255,0.25)';
          }}
          onMouseUp={(e) => {
            const el = e.currentTarget as HTMLElement;
            const rect = el.getBoundingClientRect();
            const within = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
            el.style.transition = 'color .35s ease, transform .5s cubic-bezier(.22,.61,.36,1), background .35s ease, box-shadow .45s';
            el.style.transform = within ? 'translateY(-50%) scale(1.12)' : 'translateY(-50%) scale(1)';
            el.style.boxShadow = '0 4px 18px -4px rgba(0,0,0,0.4), inset 0 0 0 0.5px rgba(255,255,255,0.3)';
          }}
          onClick={() => {
            const api = carouselRef.current;
            if (!api) return;
            if (typeof api.prev === 'function') api.prev();
            else if (typeof api.getIndex === 'function' && typeof api.goTo === 'function') api.goTo(api.getIndex() - 1);
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{display:'block'}}>
            <path d="M18 4v16L4 12z" />
          </svg>
        </button>
        <button
          aria-label="다음 슬라이드로 이동"
          style={{
            fontSize: '16px',
            position: 'fixed',
            right: '40%',
            top: '70%',
            transform: 'translateY(-50%) scale(1)',
            zIndex: 5000,
            pointerEvents: 'auto',
            width: 60,
            height: 60,
            padding: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(74, 74, 74, 0.5)',
            border: '1px solid rgba(255,255,255,0.35)',
            backdropFilter: 'blur(14px) saturate(160%)',
            WebkitBackdropFilter: 'blur(14px) saturate(160%)',
            boxShadow: '0 4px 18px -4px rgba(0,0,0,0.4), inset 0 0 0 0.5px rgba(255,255,255,0.3)',
            color: '#E4E9EC',
            letterSpacing: '1px',
            fontWeight: 500,
            outline: 'none',
            borderStyle: 'solid',
            transition: 'color .4s ease, transform .5s cubic-bezier(.22,.61,.36,1), background .4s ease, box-shadow .5s',
            willChange: 'transform'
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transition = 'color .35s ease, transform .5s cubic-bezier(.22,.61,.36,1), background .35s ease, box-shadow .45s';
            el.style.color = '#C8FF7A';
            el.style.transform = 'translateY(-50%) scale(1.12)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transition = 'color .35s ease, transform .5s cubic-bezier(.22,.61,.36,1), background .35s ease, box-shadow .45s';
            el.style.color = '#E4E9EC';
            el.style.transform = 'translateY(-50%) scale(1)';
          }}
          onMouseDown={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transition = 'transform .12s ease, background .2s ease, box-shadow .2s';
            el.style.transform = 'translateY(-50%) scale(0.95)';
            el.style.boxShadow = '0 2px 10px -2px rgba(0,0,0,0.5), inset 0 0 0 0.5px rgba(255,255,255,0.25)';
          }}
          onMouseUp={(e) => {
            const el = e.currentTarget as HTMLElement;
            const rect = el.getBoundingClientRect();
            const within = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
            el.style.transition = 'color .35s ease, transform .5s cubic-bezier(.22,.61,.36,1), background .35s ease, box-shadow .45s';
            el.style.transform = within ? 'translateY(-50%) scale(1.12)' : 'translateY(-50%) scale(1)';
            el.style.boxShadow = '0 4px 18px -4px rgba(0,0,0,0.4), inset 0 0 0 0.5px rgba(255,255,255,0.3)';
          }}
          onClick={() => {
            const api = carouselRef.current;
            if (!api) return;
            if (typeof api.next === 'function') api.next();
            else if (typeof api.getIndex === 'function' && typeof api.goTo === 'function') api.goTo(api.getIndex() + 1);
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{display:'block'}}>
            <path d="M6 4v16l14-8z" />
          </svg>
        </button>
      </>,
      document.body
    );

  return(
  <div className="three-d-viewer-wrapper">
  {/* 고정 좌/우 네비게이션 버튼 (포털로 렌더) */}
  <ButtonsPortal />
    <Canvas
      style={{ width: '100%', height: '100vh', position: "relative", zIndex: 10 }} 
      camera={{fov: 32 }}
    >
  <ambientLight intensity={0.8}  />
  <CameraController />
      <Suspense fallback={null}>
  <Model carouselRef={carouselRef} />
      </Suspense>
    </Canvas>
  </div>
  );
};

export default ThreeDViewer;