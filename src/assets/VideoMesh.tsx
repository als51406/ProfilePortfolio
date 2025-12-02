/**
 * @file VideoMesh.tsx
 * @description Three.js 3D 씬에서 비디오를 재생하는 메쉬 컴포넌트
 * 
 * 주요 기능:
 * - HTML5 Video를 THREE.VideoTexture로 변환하여 3D 평면에 렌더링
 * - isActive prop으로 재생/정지 제어 (호버 등 외부 조건에 따라)
 * - fill 모드: 카메라 뷰포트에 맞춰 자동 크기 조절 (contain 방식)
 * - 자동 종횡비 유지 및 메타데이터 기반 크기 계산
 * 
 * 사용 예시:
 * <VideoMesh
 *   src="/videos/demo.webm"
 *   width={10}
 *   height={5.6}
 *   isActive={isHovered}
 *   loop
 *   muted
 * />
 */

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ============================================================
// 타입 정의
// ============================================================
type Props = {
  src: string;                       // 비디오 URL
  width?: number;                    // 메쉬 너비 (Three.js 단위)
  height?: number;                   // 메쉬 높이 (없으면 종횡비로 계산)
  position?: [number, number, number];  // 메쉬 위치
  loop?: boolean;                    // 반복 재생
  muted?: boolean;                   // 음소거
  autoPlay?: boolean;                // 자동 재생 (사용하지 않음, isActive로 제어)
  playsInline?: boolean;             // 인라인 재생 (모바일 대응)
  toneMapped?: boolean;              // 톤 매핑 적용 여부
  fill?: boolean;                    // 뷰포트에 맞춰 자동 크기 조절
  isActive?: boolean;                // 재생 활성화 상태
};

// ============================================================
// VideoMesh 컴포넌트
// ============================================================
const VideoMesh: React.FC<Props> = ({
  src,
  width = 2,
  height,
  position = [0, 0, 0],
  loop = true,
  muted = true,
  autoPlay = true,
  playsInline = true,
  toneMapped = false,
  fill = false,
  isActive = true,
}) => {
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  
  // State
  const [videoReady, setVideoReady] = useState(false);
  const [videoAspect, setVideoAspect] = useState(16 / 9);  // 기본 종횡비
  
  // Three.js 훅
  const { gl, camera, viewport } = useThree();

  // ============================================================
  // 비디오 요소 생성 및 텍스처 초기화
  // ============================================================
  useEffect(() => {
    // HTML5 Video 요소 생성
    const video = document.createElement('video');
    video.src = src;
    video.crossOrigin = 'anonymous';
    video.loop = loop;
    video.muted = muted;
    video.playsInline = playsInline;
    video.autoplay = false;  // 자동 재생 비활성화 (isActive로 제어)
    
    // 비디오 메타데이터 로드 후 종횡비 계산
    video.addEventListener('loadedmetadata', () => {
      if (video.videoWidth && video.videoHeight) {
        setVideoAspect(video.videoWidth / video.videoHeight);
      }
    });

    // 비디오 데이터 로드 완료
    video.addEventListener('loadeddata', () => {
      setVideoReady(true);
    });

    videoRef.current = video;

    // VideoTexture 생성 및 설정
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;  // sRGB 색공간
    texture.minFilter = THREE.LinearFilter;      // 축소 필터
    texture.magFilter = THREE.LinearFilter;      // 확대 필터
    texture.format = THREE.RGBAFormat;           // RGBA 포맷
    
    // 비등방성 필터링 (텍스처 선명도 향상)
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    texture.anisotropy = Math.max(1, maxAniso);
    
    textureRef.current = texture;

    // 클린업: 컴포넌트 언마운트 시 리소스 해제
    return () => {
      video.pause();
      video.src = '';
      video.load();
      texture.dispose();
    };
  }, [src, loop, muted, playsInline, gl]);

  // ============================================================
  // 재생/정지 제어 (isActive 상태에 따라)
  // ============================================================
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoReady) return;

    if (isActive) {
      // 활성화: 처음부터 재생
      video.currentTime = 0;
      video.play().catch((e) => console.warn('Video play failed:', e));
    } else {
      // 비활성화: 정지하고 처음으로 되돌림
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive, videoReady]);

  // ============================================================
  // 매 프레임 텍스처 업데이트
  // - 비디오가 재생 중일 때만 텍스처 갱신
  // ============================================================
  useFrame(() => {
    if (textureRef.current && videoRef.current && !videoRef.current.paused) {
      textureRef.current.needsUpdate = true;
    }
  });

  // ============================================================
  // 메쉬 크기 계산
  // - fill 모드: 뷰포트에 맞춰 contain 방식으로 크기 조절
  // - 수동 모드: props의 width/height 사용
  // ============================================================
  const { w, h } = useMemo(() => {
    if (fill) {
      // RenderTexture 내부 카메라 기준으로 뷰포트 크기 계산
      const vw = viewport.width;
      const vh = viewport.height;
      const viewAspect = vw / vh;
      
      // contain 방식: 영상 전체가 보이도록 (여백 허용)
      let finalW: number, finalH: number;
      if (videoAspect > viewAspect) {
        // 영상이 더 넓음 → 가로 기준으로 맞춤
        finalW = vw;
        finalH = vw / videoAspect;
      } else {
        // 영상이 더 좁음 → 세로 기준으로 맞춤
        finalH = vh;
        finalW = vh * videoAspect;
      }
      return { w: finalW, h: finalH };
    }
    
    // 수동 모드: props의 width/height 사용
    const finalH = typeof height === 'number' ? height : width / videoAspect;
    return { w: width, h: finalH };
  }, [fill, width, height, videoAspect, viewport]);

  // 텍스처가 아직 준비되지 않으면 렌더링하지 않음
  if (!textureRef.current) {
    return null;
  }

  // ============================================================
  // 렌더링: 평면 메쉬에 비디오 텍스처 적용
  // ============================================================
  return (
    <mesh position={position}>
      {/* 평면 지오메트리 (계산된 w, h 크기) */}
      <planeGeometry args={[w, h]} />
      
      {/* 비디오 텍스처를 맵으로 사용하는 머터리얼 */}
      <meshBasicMaterial
        map={textureRef.current}
        toneMapped={toneMapped}
        side={THREE.FrontSide}
      />
    </mesh>
  );
};

export default VideoMesh;
