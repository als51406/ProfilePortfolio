import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Props = {
  src: string;
  width?: number;
  height?: number;
  position?: [number, number, number];
  loop?: boolean;
  muted?: boolean;
  autoPlay?: boolean;
  playsInline?: boolean;
  toneMapped?: boolean;
  fill?: boolean; // 카메라 뷰에 꽉 채우기 (contain 방식 - 영상 전체 보임)
  isActive?: boolean; // 활성화 상태 (true일 때만 재생)
};

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
  isActive = true, // 기본값: 항상 재생
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoAspect, setVideoAspect] = useState(16 / 9);
  const { gl, camera, viewport } = useThree();

  // 비디오 요소 생성 및 텍스처 초기화
  useEffect(() => {
    const video = document.createElement('video');
    video.src = src;
    video.crossOrigin = 'anonymous';
    video.loop = loop;
    video.muted = muted;
    video.playsInline = playsInline;
    video.autoplay = false; // 자동 재생 비활성화 (isActive로 제어)
    
    // 비디오 메타데이터 로드 후 종횡비 설정
    video.addEventListener('loadedmetadata', () => {
      if (video.videoWidth && video.videoHeight) {
        setVideoAspect(video.videoWidth / video.videoHeight);
      }
    });

    // 비디오 로드 완료
    video.addEventListener('loadeddata', () => {
      setVideoReady(true);
    });

    videoRef.current = video;

    // VideoTexture 생성
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;
    
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    texture.anisotropy = Math.max(1, maxAniso);
    
    textureRef.current = texture;

    return () => {
      video.pause();
      video.src = '';
      video.load();
      texture.dispose();
    };
  }, [src, loop, muted, playsInline, gl]);

  // isActive 상태에 따라 재생/정지 제어
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoReady) return;

    if (isActive) {
      // 활성화: 처음부터 재생
      video.currentTime = 0;
      video.play().catch((e) => console.warn('Video play failed:', e));
    } else {
      // 비활성화: 정지하고 처음으로
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive, videoReady]);

  // 매 프레임 텍스처 업데이트
  useFrame(() => {
    if (textureRef.current && videoRef.current && !videoRef.current.paused) {
      textureRef.current.needsUpdate = true;
    }
  });

  // fill 모드: 카메라 뷰에 맞추기 (contain 방식 - 영상 전체 보임)
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
    
    // 수동 모드
    const finalH = typeof height === 'number' ? height : width / videoAspect;
    return { w: width, h: finalH };
  }, [fill, width, height, videoAspect, viewport]);

  if (!textureRef.current) {
    return null;
  }

  return (
    <mesh position={position}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        map={textureRef.current}
        toneMapped={toneMapped}
        side={THREE.FrontSide}
      />
    </mesh>
  );
};

export default VideoMesh;
