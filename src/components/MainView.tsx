/**
 * @file MainView.tsx
 * @description 메인 3D 뷰어 컴포넌트
 * 
 * 주요 기능:
 * - Three.js 기반 3D 씬 렌더링
 * - GLB 모델을 활용한 3D 배경 (스튜디오 환경)
 * - 마우스 패럴랙스 카메라 컨트롤러
 * - 3D 캐러셀을 통한 프로젝트 영상 쇼케이스
 * - 좌/우 네비게이션 버튼 (React Portal 활용)
 * 
 * 컴포넌트 구조:
 * - CameraController: 마우스 움직임에 따른 카메라 패럴랙스 효과
 * - Model: 3D 배경 모델 + MeshCarousel3D 캐러셀
 * - ThreeDViewer: Canvas 래퍼 및 네비게이션 버튼
 */

import React, { Suspense, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Canvas } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import MeshCarousel3D, { MeshCarousel3DHandle } from './MeshCarousel3D';
import VideoMesh from '../assets/VideoMesh';

// ============================================================
// 3D 모델 사전 로딩 (Preload)
// - 초기 렌더링 성능 향상을 위해 GLB 모델을 미리 로드
// ============================================================
useGLTF.preload(process.env.PUBLIC_URL + '/3d/studio_30.glb');

// ============================================================
// CameraController 컴포넌트
// - 마우스 움직임에 따른 카메라 위치 패럴랙스 효과
// - GSAP를 사용한 부드러운 카메라 이동 애니메이션
// ============================================================
function CameraController() {
  const { camera } = useThree();

  useEffect(() => {
    // 카메라 초기 위치 설정: z축 전방, y축 약간 위를 바라봄
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 1, 0);
    
    // 카메라 이동 범위 제한값
    const minX = -2.2, maxX = 2.2;
    const minY = -1, maxY = 1;
    
    /**
     * 마우스 이동 이벤트 핸들러
     * - 마우스 위치를 정규화하여 카메라 위치 계산
     * - GSAP로 부드러운 카메라 이동 애니메이션 적용
     */
    const handleMouseMove = (e: MouseEvent) => {
      // 마우스 위치를 -0.5 ~ 0.5 범위로 정규화 후 스케일 적용
      let x = (e.clientX / window.innerWidth - 0.5) * 10;
      let y = (0.5 - e.clientY / window.innerHeight) * 5;
      
      // 이동 범위 클램핑
      x = Math.max(minX, Math.min(maxX, x));
      y = Math.max(minY, Math.min(maxY, y));
      
      // GSAP 애니메이션으로 카메라 부드럽게 이동
      gsap.to(camera.position, {
        x,
        y,
        duration: 5,
        ease: 'power2.out',
        onUpdate: () => camera.lookAt(0, 1, 0) // 항상 중앙을 바라보도록
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [camera]);
  
  return null;
}

// ============================================================
// Model 컴포넌트 Props 타입 정의
// ============================================================
interface ModelProps {
  carouselRef?: React.RefObject<MeshCarousel3DHandle | null>;
}

// ============================================================
// Model 컴포넌트
// - 3D 배경 모델 렌더링 (스튜디오 환경)
// - 메인 타이틀 텍스트 (Html 오버레이)
// - MeshCarousel3D를 통한 프로젝트 영상 캐러셀
// ============================================================
function Model({ carouselRef }: ModelProps) {
    // GLB 모델 로드
    const gltf = useGLTF(process.env.PUBLIC_URL + '/3d/studio_30.glb');
    
    
    
  return (
    <>
      {/* ==================== 3D 배경 모델 ==================== */}
      {/* 스튜디오 환경 GLB 모델 - 씬의 배경으로 사용 */}
      <primitive
        object={gltf.scene}
        scale={[3, 3, 3]}
        rotation={[0, 0, 0]}
        position={[0, -2, 0]}
      />


      {/* ==================== 메인 타이틀 텍스트 ==================== */}
      {/* Html 컴포넌트를 사용해 3D 공간에 DOM 요소 배치 */}
      <mesh position={[0, 3.6, 5]}>
        <Html center style={{  pointerEvents: 'none',
                                zIndex: 1000,
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

      {/* ==================== 3D 프로젝트 캐러셀 ==================== */}
      {/* MeshCarousel3D: 3개의 패널로 구성된 3D 캐러셀 */}
      {/* 각 패널에는 프로젝트 영상이 VideoMesh로 렌더링됨 */}
        <MeshCarousel3D
        ref={carouselRef}
        count={3}                    // 패널 개수
        radius={9}                   // 캐러셀 반지름
        y={1.5}                      // Y축 위치
        panelW={3}                   // 패널 너비
        panelH={1.5}                 // 패널 높이
        sensitivity={0.007}          // 드래그 감도
        focusScale={1.8}             // 중앙 패널 확대 배율
        inertia                      // 관성 효과 활성화
        snap                         // 스냅 효과 활성화
        facing="camera"              // 패널이 항상 카메라를 향하도록
        enableDrag={false}           // 드래그 비활성화 (버튼으로만 제어)
        
        // 패널 클릭 시 해당 프로젝트 URL로 이동
        onPanelClick={(i) => {
          const urls = [
            'https://als51406.mycafe24.com/3dPortfolio/',  // 3D 포트폴리오
            'http://zoomedia.synology.me:7780/',          // 토닥톡
            'http://zoomedia.synology.me:9000/',          // Purfit
          ];
          const url = urls[i] ?? urls[0];
          window.open(url, '_blank', 'noopener,noreferrer');
        }}
        
        // RenderTexture 설정 (캐러셀 내부 영상 렌더링 품질)
        rtWidth={540}                // 텍스처 가로 해상도
        rtHeight={300}               // 텍스처 세로 해상도
        rtSamples={0}                // MSAA 샘플 수
        rtAnisotropy={12}            // 비등방성 필터링
        lockPanelToRTAspect          // 패널 비율을 텍스처 비율에 맞춤
        
        // 각 패널의 고정 위치 (슬롯 모드)
        positions={[
          [0, 1.5, 1],               // 중앙 (정면)
          [7, 1, -0.5],              // 우측
          [-7, 1, -0.5],             // 좌측
        ]}
        
        /**
         * rtContent: 각 패널 내부에 렌더링할 콘텐츠
         * @param i - 패널 인덱스
         * @param activeIndex - 현재 활성화된 패널 인덱스
         * @param isHovered - 해당 패널 호버 여부
         * 
         * 재생 조건: 중앙 패널(activeIndex)이고 호버 상태일 때만 재생
         */
        rtContent={(i, activeIndex, isHovered) => {
          const shouldPlay = (i === activeIndex) && isHovered;
          
          // 스크린 1: 3D 포트폴리오 영상
          if (i === 0) {
            return (
              <>
                <color attach="background" args={["#000000"]} />
                <VideoMesh 
                  src={process.env.PUBLIC_URL + '/videos/3d_vd.webm'} 
                  width={10.44}
                  height={5.8}
                  loop 
                  muted 
                  isActive={shouldPlay}
                />
              </>
            );
          }
          // 스크린 2: 토닥톡 영상
          if (i === 1) {
            return (
              <>
                <color attach="background" args={["#000000"]} />
                <VideoMesh 
                  src={process.env.PUBLIC_URL + '/videos/todaktok_vd.webm'} 
                  width={12}
                  height={5.8}
                  loop 
                  muted 
                  isActive={shouldPlay}
                />
              </>
            );
          }
          // 스크린 3: Purfit 쇼핑몰 영상
          return (
            <>
              <color attach="background" args={["#000000"]} />
              <VideoMesh 
                src={process.env.PUBLIC_URL + '/videos/purfit_vd.webm'} 
                width={12.006}
                height={5.8}
                loop 
                muted 
                isActive={shouldPlay}
              />
            </>
          );
        }}
      />


    </>
  );
}

// ============================================================
// ThreeDViewer 컴포넌트 (메인 내보내기)
// - Canvas와 3D 씬을 래핑하는 최상위 컴포넌트
// - 좌/우 네비게이션 버튼 포함 (React Portal로 body에 렌더링)
// ============================================================
const ThreeDViewer: React.FC = () => {
  // 캐러셀 API 접근을 위한 ref
  const carouselRef = useRef<MeshCarousel3DHandle>(null);
  
  // 버튼 클릭 쓰로틀링을 위한 ref
  const lastClickTime = useRef<number>(0);
  const CLICK_THROTTLE_MS = 400; // 연속 클릭 방지 시간 (0.4초)

  /**
   * 쓰로틀된 클릭 핸들러
   * - 연속 클릭 시 애니메이션 겹침 방지
   * @param action - 실행할 액션 함수
   */
  const handleThrottledClick = (action: () => void) => {
    const now = Date.now();
    if (now - lastClickTime.current < CLICK_THROTTLE_MS) {
      return; // 쓰로틀 시간 내 클릭 무시
    }
    lastClickTime.current = now;
    action();
  };

  /**
   * ButtonsPortal 컴포넌트
   * - React Portal을 사용해 document.body에 네비게이션 버튼 렌더링
   * - Canvas 외부에 버튼을 배치하여 z-index 문제 해결
   */
  const ButtonsPortal: React.FC = () =>
    createPortal(
      <>
        {/* ==================== 이전 버튼 (왼쪽) ==================== */}
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
            handleThrottledClick(() => {
              const api = carouselRef.current;
              if (!api) return;
              if (typeof api.prev === 'function') api.prev();
              else if (typeof api.getIndex === 'function' && typeof api.goTo === 'function') api.goTo(api.getIndex() - 1);
            });
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{display:'block'}}>
            <path d="M18 4v16L4 12z" />
          </svg>
        </button>
        
        {/* ==================== 다음 버튼 (오른쪽) ==================== */}
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
            handleThrottledClick(() => {
              const api = carouselRef.current;
              if (!api) return;
              if (typeof api.next === 'function') api.next();
              else if (typeof api.getIndex === 'function' && typeof api.goTo === 'function') api.goTo(api.getIndex() + 1);
            });
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
    {/* 고정 좌/우 네비게이션 버튼 (포털로 body에 렌더링) */}
    <ButtonsPortal />
    
    {/* ==================== Three.js Canvas ==================== */}
    {/* React Three Fiber의 Canvas 컴포넌트 */}
    <Canvas
      style={{ width: '100%', height: '100vh', position: "relative", zIndex: 10 }} 
      camera={{fov: 32 }}  // 시야각 32도 (좁은 화각으로 압축 효과)
    >
      {/* 전역 조명 */}
      <ambientLight intensity={0.8} />
      
      {/* 마우스 패럴랙스 카메라 컨트롤러 */}
      <CameraController />
      
      {/* 3D 모델 (로딩 중 fallback: null) */}
      <Suspense fallback={null}>
        <Model carouselRef={carouselRef} />
      </Suspense>
    </Canvas>
  </div>
  );
};

export default ThreeDViewer;