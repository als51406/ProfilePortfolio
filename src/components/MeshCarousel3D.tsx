/**
 * @file MeshCarousel3D.tsx
 * @description 3D 메쉬 기반 캐러셀 컴포넌트
 * 
 * 주요 기능:
 * - Three.js 기반 3D 공간에서 동작하는 캐러셀
 * - RenderTexture를 사용한 패널별 독립적인 씬 렌더링
 * - 두 가지 모드 지원: 회전 모드(원형 배치) / 슬롯 모드(고정 위치)
 * - GSAP 애니메이션을 통한 부드러운 전환 효과
 * - 드래그 제스처 및 관성/스냅 지원
 * - 호버 시 스케일 확대 효과
 * 
 * 사용 예시:
 * <MeshCarousel3D
 *   count={3}
 *   positions={[[0,0,0], [5,0,0], [-5,0,0]]}
 *   rtContent={(i, activeIndex, isHovered) => <YourContent />}
 * />
 */

import React, { useMemo, useRef, forwardRef, useImperativeHandle, useEffect, Suspense, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useDrag } from '@use-gesture/react';
import { RenderTexture, PerspectiveCamera } from '@react-three/drei';
import gsap from 'gsap';
import Detailview from '../assets/Detailview';

// ============================================================
// 타입 정의
// ============================================================

/** 패널 렌더링 함수 타입 (커스텀 3D 패널용) */
type RenderPanel = (index: number) => React.ReactNode;

/** MeshCarousel3D Props 타입 */
type Props = {
  count: number;                    // 패널 개수
  radius?: number;                  // 캐러셀 반지름 (회전 모드)
  y?: number;                       // Y축 위치
  panelW?: number;                  // 패널 너비 (시각적 크기)
  panelH?: number;                  // 패널 높이
  sensitivity?: number;             // 드래그 감도 (라디안/픽셀)
  focusScale?: number;              // 정면 패널 확대 배율
  inertia?: boolean;                // 관성 효과 활성화
  friction?: number;                // 관성 마찰 계수 (0~1)
  inertiaScale?: number;            // 제스처 속도 → 각속도 매핑 계수
  snap?: boolean;                   // 스냅 효과 활성화
  renderPanel?: RenderPanel;        // 커스텀 패널 렌더 함수
  facing?: 'camera' | 'center' | 'world';  // 패널 방향 모드
  positions?: Array<[number, number, number]>;  // 슬롯 모드용 고정 위치
  enableDrag?: boolean;             // 드래그 활성화 여부
  slotScales?: number[];            // 슬롯별 스케일 값
  rtWidth?: number;                 // RenderTexture 가로 해상도
  rtHeight?: number;                // RenderTexture 세로 해상도
  rtSamples?: number;               // MSAA 샘플 수
  rtAnisotropy?: number;            // 비등방성 필터링 강도
  lockPanelToRTAspect?: boolean;    // 패널 비율을 RT 비율에 맞춤
  rtLookAt?: [number, number, number];  // RT 카메라 타겟
  hoverScale?: number;              // 호버 시 추가 배율
  rtContent?: (index: number, activeIndex: number, isHovered: boolean) => React.ReactNode;  // 패널 콘텐츠
  onPanelClick?: (index: number) => void;  // 패널 클릭 핸들러
  onIndexChange?: (index: number) => void; // 인덱스 변경 콜백
};

/** 외부에서 접근 가능한 캐러셀 API */
export type MeshCarousel3DHandle = {
  next: () => void;          // 다음 패널로 이동
  prev: () => void;          // 이전 패널로 이동
  goTo: (index: number) => void;  // 특정 인덱스로 이동
  getIndex: () => number;    // 현재 인덱스 반환
};

// ============================================================
// MeshCarousel3D 컴포넌트
// ============================================================
const MeshCarousel3D = forwardRef<MeshCarousel3DHandle, Props>(function MeshCarousel3D(
  {
    count,
    radius = 8,
    y = 1.2,
    panelW = 2,
    panelH = 1.2,
    sensitivity = 0.006,
    focusScale = 1.15,
    inertia = true,
    friction = 0.92,
    inertiaScale = 12,
    snap = true,
    renderPanel,
    facing = 'camera',
    positions,
    enableDrag = true,
    slotScales,
  rtWidth = 1280,
  rtHeight = 720,
  rtSamples = 0,
  rtAnisotropy = 8,
  lockPanelToRTAspect = true,
  rtLookAt = [0, 0, 0],
  hoverScale = 1.06,
  rtContent,
  onPanelClick,
  onIndexChange,
  }: Props,
  ref
) {
  // ============================================================
  // Refs 및 Three.js 훅
  // ============================================================
  const groupRef = useRef<THREE.Group>(null!);        // 캐러셀 그룹 ref
  const panelRefs = useRef<THREE.Group[]>([]);        // 각 패널 그룹 refs
  const contentRefs = useRef<THREE.Group[]>([]);      // 각 콘텐츠 그룹 refs
  const hoverFlags = useRef<boolean[]>(Array.from({ length: count }, () => false));  // 호버 상태
  const { gl, camera } = useThree();

  // 패널 간 각도 간격 (라디안)
  const step = useMemo(() => (Math.PI * 2) / count, [count]);

  // ============================================================
  // 상태 관리 (Ref 기반 - 프레임마다 업데이트)
  // ============================================================
  const angle = useRef(0);              // 현재 회전 각도 (라디안)
  const vel = useRef(0);                // 관성 각속도
  const dragging = useRef(false);       // 드래그 중 여부
  const over = useRef(false);           // 캐러셀 위에 커서 있는지
  const snapTarget = useRef<number | null>(null);  // 스냅 목표 각도
  const lastDx = useRef(0);             // 마지막 드래그 델타
  const currentIndex = useRef(0);       // 현재 활성 인덱스
  const panelSlot = useRef<number[]>(Array.from({ length: count }, (_, i) => i % count));  // 패널→슬롯 매핑
  
  // React 상태 (리렌더링 트리거용)
  const [activeIndex, setActiveIndex] = useState(0);      // 활성 패널 인덱스
  const [hoveredPanel, setHoveredPanel] = useState<number | null>(null);  // 호버된 패널

  // ============================================================
  // 슬롯 모드 설정
  // - positions가 제공되면 슬롯 모드 (고정 위치)
  // - 제공되지 않으면 회전 모드 (원형 배치)
  // ============================================================
  const discrete = Array.isArray(positions) && positions.length >= count;
  
  // 슬롯 로컬 좌표 계산 (Y 오프셋 적용)
  const slotLocals = useMemo(() => {
    if (!discrete || !positions) return [] as Array<[number, number, number]>;
    return positions.slice(0, count).map(([x, wy, z]) => [x, wy - y, z] as [number, number, number]);
  }, [discrete, positions, count, y]);
  
  // 슬롯별 스케일 값 (기본: 첫 번째 슬롯만 focusScale)
  const slotScaleVals = useMemo(() => {
    if (!discrete) return [] as number[];
    if (slotScales && slotScales.length >= count) return slotScales.slice(0, count);
    const arr = new Array(count).fill(1);
    arr[0] = focusScale;  // 정면 슬롯만 확대
    return arr;
  }, [discrete, slotScales, count, focusScale]);

  // ============================================================
  // 드래그 제스처 핸들러
  // - @use-gesture/react의 useDrag 훅 사용
  // - 회전 모드에서만 동작 (슬롯 모드에서는 비활성)
  // ============================================================
  useDrag(
    ({ down, delta: [dx], velocity: [vx], direction: [dirX], last }) => {
      if (!enableDrag || !over.current || discrete) return;

      dragging.current = down;
      if (down) {
        // 드래그 중: 스냅 취소 및 각도 업데이트
        snapTarget.current = null;
        const delta = -dx * sensitivity;
        angle.current += delta * 0.9 + lastDx.current * 0.1;  // 스무딩 적용
        lastDx.current = delta;
      } else if (last) {
        // 드래그 종료: 관성 또는 스냅 적용
        if (inertia) {
          const targetVel = -dirX * vx * sensitivity * inertiaScale;
          vel.current = vel.current * 0.35 + targetVel * 0.65;  // 속도 블렌딩
          lastDx.current = 0;
        } else if (snap) {
          const idx = Math.round(angle.current / step);
          snapTarget.current = idx * step;
        }
      }
    },
    { target: gl.domElement, filterTaps: true }
  );

  // ============================================================
  // 프레임 업데이트 (useFrame)
  // - 관성/스냅 처리
  // - 패널 스케일 애니메이션
  // - 패널 방향(facing) 처리
  // ============================================================
  useFrame(() => {
    if (!discrete) {
      // ==================== 회전 모드 ====================
      // 관성 처리: 속도가 임계값 이상일 때 계속 회전
      if (!dragging.current && inertia && Math.abs(vel.current) > 1e-4) {
        angle.current += vel.current;
        vel.current *= friction;  // 마찰로 속도 감쇠
        
        // 속도가 충분히 낮아지면 스냅
        if (snap && Math.abs(vel.current) < 0.005) {
          vel.current = 0;
          const idx = Math.round(angle.current / step);
          snapTarget.current = idx * step;
        }
      }
      
      // 스냅 처리: 목표 각도로 보간
      if (!dragging.current && snapTarget.current !== null) {
        const t = snapTarget.current;
        const diff = t - angle.current;
        angle.current += diff * 0.15;
        if (Math.abs(diff) < 1e-3) snapTarget.current = null;
      }
      
      // 그룹 회전 적용
      if (groupRef.current) groupRef.current.rotation.y = angle.current;
      
      // 활성 인덱스 업데이트
      const newIndex = ((Math.round(angle.current / step) % count) + count) % count;
      if (currentIndex.current !== newIndex) {
        currentIndex.current = newIndex;
        setActiveIndex(newIndex);
        onIndexChange?.(newIndex);
      }
      currentIndex.current = newIndex;
    } else {
      // ==================== 슬롯 모드 ====================
      // 현재 인덱스만 업데이트 (activeIndex는 애니메이션 완료 후 업데이트)
      const idx = panelSlot.current.findIndex((s) => s === 0);
      const newIndex = idx >= 0 ? idx : 0;
      currentIndex.current = newIndex;
    }

    // ==================== 콘텐츠 스케일 애니메이션 ====================
    // 중앙 패널의 콘텐츠를 원하는 픽셀 크기로 보이도록 스케일 조정
    if (contentRefs.current.length) {
      const frontIdx = panelSlot.current.findIndex((s) => s === 0);
      for (let i = 0; i < contentRefs.current.length; i++) {
        const cg = contentRefs.current[i];
        if (!cg) continue;
        
        let target = 1;
        if (discrete && i === frontIdx) {
          // 카메라 공간에서의 z 거리 계산
          const pw = new THREE.Vector3();
          panelRefs.current[i]?.getWorldPosition(pw);
          const pw4 = new THREE.Vector4(pw.x, pw.y, pw.z, 1);
          pw4.applyMatrix4(camera.matrixWorldInverse);
          const zCam = Math.abs(pw4.z);
          
          // FOV와 뷰포트를 기반으로 목표 월드 높이 계산
          const fovRad = (camera as THREE.PerspectiveCamera).fov * Math.PI / 180;
          const viewportH = window.innerHeight;
          const desiredPxH = rtHeight;
          const targetWorldH = 2 * zCam * Math.tan(fovRad / 2) * (desiredPxH / viewportH);
          
          // 스케일 계산
          const aspect = rtWidth / rtHeight;
          const baseH = (lockPanelToRTAspect ? panelW / aspect : panelH);
          const groupScaleY = panelRefs.current[i]?.scale.y ?? 1;
          target = targetWorldH / (baseH * groupScaleY);
        }
        
        // 호버 배율 적용
        const hoverMul = hoverFlags.current[i] ? hoverScale : 1;
        const desired = target * hoverMul;
        
        // 부드러운 보간 (lerp factor 0.08로 부드럽게)
        const cur = cg.scale.y;
        const lerpFactor = 0.08;
        const next = THREE.MathUtils.lerp(cur, desired, lerpFactor);
        
        // 차이가 매우 작으면 즉시 적용 (떨림 방지)
        const finalScale = Math.abs(desired - next) < 0.001 ? desired : next;
        cg.scale.set(finalScale, finalScale, finalScale);
      }
    }

    // ==================== 패널 방향(Facing) 처리 ====================
    // 각 패널이 카메라/센터를 향하도록 Y축 회전
    if (panelRefs.current.length) {
      const gy = groupRef.current ? groupRef.current.rotation.y : 0;
      for (let i = 0; i < panelRefs.current.length; i++) {
        const g = panelRefs.current[i];
        if (!g) continue;
        if (facing === 'world') continue;  // world 모드: 로컬 회전 유지
        
        // 월드 위치 계산
        const worldPos = new THREE.Vector3();
        g.getWorldPosition(worldPos);
        
        let yawTarget = 0;
        if (facing === 'camera') {
          // camera 모드: 카메라 방향을 바라봄
          yawTarget = Math.atan2(camera.position.x - worldPos.x, camera.position.z - worldPos.z);
        } else if (facing === 'center') {
          // center 모드: 원점을 바라봄
          yawTarget = Math.atan2(-worldPos.x, -worldPos.z);
        }
        
        // 로컬 회전 계산: worldYaw = groupYaw + localYaw
        g.rotation.y = yawTarget - gy;
      }
    }
  });

  // ============================================================
  // 초기 슬롯 위치 설정 (슬롯 모드)
  // ============================================================
  useEffect(() => {
    if (!discrete) return;
    for (let i = 0; i < count; i++) {
      const g = panelRefs.current[i];
      const slot = panelSlot.current[i];
      if (!g || slotLocals.length <= slot) continue;
      const [x, yy, z] = slotLocals[slot];
      const sc = slotScaleVals[slot] ?? 1;
      g.position.set(x, yy, z);
      g.scale.set(sc, sc, sc);
    }
  }, [discrete, count, slotLocals, slotScaleVals]);

  // ============================================================
  // 유틸리티 함수
  // ============================================================
  
  /** 인덱스 정규화 (0 ~ count-1 범위로) */
  const normalizeIndex = (idx: number) => ((idx % count) + count) % count;

  /**
   * 특정 인덱스로 이동
   * - 회전 모드: 목표 각도로 스냅
   * - 슬롯 모드: GSAP 애니메이션으로 패널 위치 변경
   */
  const goTo = (index: number) => {
    const targetIdx = normalizeIndex(index);
    if (!discrete) {
      // 회전 모드: 목표 각도로 스냅 유도
      const targetAngle = targetIdx * step;
      dragging.current = false;
      vel.current = 0;
      snapTarget.current = targetAngle;
      return;
    }
    
    // 슬롯 모드: targetIdx 패널이 슬롯 0(정면)에 오도록 전체 슬롯 회전
    const currentSlotOfTarget = panelSlot.current[targetIdx] ?? 0;
    const newMap = panelSlot.current.map((s) => (s - currentSlotOfTarget + count) % count);
    panelSlot.current = newMap;
    
    // GSAP 애니메이션으로 각 패널 이동
    for (let p = 0; p < count; p++) {
      const g = panelRefs.current[p];
      const sIdx = newMap[p];
      if (!g || slotLocals.length <= sIdx) continue;
      const [x, yy, z] = slotLocals[sIdx];
      const sc = slotScaleVals[sIdx] ?? 1;
      gsap.to(g.position, { x, y: yy, z, duration: 0.6, ease: 'power3.out' });
      gsap.to(g.scale, { x: sc, y: sc, z: sc, duration: 0.6, ease: 'power3.out' });
    }
  };

  /**
   * 다음 패널로 이동
   * - 슬롯을 +1 회전시켜 다음 패널이 정면으로
   */
  const next = () => {
    if (!discrete) return goTo(currentIndex.current + 1);
    
    const newMap = panelSlot.current.map((s) => (s + 1) % count);
    panelSlot.current = newMap;
    
    // 새 정면 패널 인덱스 찾기
    const newFrontIdx = newMap.findIndex((s) => s === 0);
    
    // GSAP 애니메이션 (완료 시 activeIndex 업데이트)
    for (let p = 0; p < count; p++) {
      const g = panelRefs.current[p];
      const sIdx = newMap[p];
      if (!g || slotLocals.length <= sIdx) continue;
      const [x, yy, z] = slotLocals[sIdx];
      const sc = slotScaleVals[sIdx] ?? 1;
      gsap.to(g.position, { x, y: yy, z, duration: 0.6, ease: 'power3.out' });
      gsap.to(g.scale, { 
        x: sc, y: sc, z: sc, 
        duration: 0.6, 
        ease: 'power3.out',
        // 정면 패널의 애니메이션 완료 시 상태 업데이트
        onComplete: p === newFrontIdx ? () => {
          setActiveIndex(newFrontIdx);
          onIndexChange?.(newFrontIdx);
        } : undefined
      });
    }
  };

  /**
   * 이전 패널로 이동
   * - 슬롯을 -1 회전시켜 이전 패널이 정면으로
   */
  const prev = () => {
    if (!discrete) return goTo(currentIndex.current - 1);
    
    const newMap = panelSlot.current.map((s) => (s - 1 + count) % count);
    panelSlot.current = newMap;
    
    const newFrontIdx = newMap.findIndex((s) => s === 0);
    
    for (let p = 0; p < count; p++) {
      const g = panelRefs.current[p];
      const sIdx = newMap[p];
      if (!g || slotLocals.length <= sIdx) continue;
      const [x, yy, z] = slotLocals[sIdx];
      const sc = slotScaleVals[sIdx] ?? 1;
      gsap.to(g.position, { x, y: yy, z, duration: 0.6, ease: 'power3.out' });
      gsap.to(g.scale, { 
        x: sc, y: sc, z: sc, 
        duration: 0.6, 
        ease: 'power3.out',
        onComplete: p === newFrontIdx ? () => {
          setActiveIndex(newFrontIdx);
          onIndexChange?.(newFrontIdx);
        } : undefined
      });
    }
  };

  // 외부에서 접근 가능한 API 노출
  useImperativeHandle(ref, () => ({ next, prev, goTo, getIndex: () => ((currentIndex.current % count) + count) % count }), [count]);

  /**
   * 회전 모드에서 패널 스케일 계산
   * - 정면에 가까울수록 focusScale에 가까운 값
   */
  const scaleFor = (i: number) => {
    const rel = i * step - angle.current;
    const a = Math.atan2(Math.sin(rel), Math.cos(rel));  // [-PI, PI] 정규화
    const t = 1 - Math.min(Math.abs(a) / Math.PI, 1);    // 정면=1, 후면=0
    return 1 + (focusScale - 1) * (t * t);
  };

  // ============================================================
  // 렌더링
  // ============================================================
  return (
    <group
      ref={groupRef}
      position={[0, y, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        over.current = true;
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        over.current = false;
      }}
    >
      {/* 각 패널 렌더링 */}
      {Array.from({ length: count }).map((_, i) => {
        // 기본 원형 배치 좌표 계산
        const base = i * step;
        const computedX = Math.sin(base) * radius;
        const computedZ = Math.cos(base) * radius;

        // 슬롯 모드면 슬롯 좌표 사용
        let px = computedX, py = 0, pz = computedZ, s = scaleFor(i);
        if (discrete) {
          const slotIdx = panelSlot.current[i] ?? i;
          if (slotLocals[slotIdx]) {
            const [sx, sy, sz] = slotLocals[slotIdx];
            px = sx; py = sy; pz = sz;
          }
          s = slotScaleVals[slotIdx] ?? 1;
        }

        return (
          <group
            key={i}
            ref={(el) => {
              if (el) panelRefs.current[i] = el;
            }}
            position={[px, py, pz]}
            rotation={[0, 0, 0]}
          >
            {/* ==================== 호버 감지용 투명 플레인 ==================== */}
            {/* 클릭/호버 이벤트를 캡처하는 보이지 않는 메쉬 */}
            <mesh
              position={[0, 0, 0.08]}
              onPointerOver={(e) => {
                e.stopPropagation();
                hoverFlags.current[i] = true;
                try { (gl.domElement as HTMLCanvasElement).style.cursor = 'pointer'; } catch {}
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                hoverFlags.current[i] = false;
                try { (gl.domElement as HTMLCanvasElement).style.cursor = 'default'; } catch {}
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (typeof onPanelClick === 'function') onPanelClick(i);
              }}
              onPointerEnter={() => setHoveredPanel(i)}
              onPointerLeave={() => setHoveredPanel(null)}
            >
              <planeGeometry args={[panelW * 1.15, panelH * 1.15]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {/* ==================== 패널 콘텐츠 ==================== */}
            {renderPanel ? (
              // 커스텀 렌더 함수가 있으면 사용
              renderPanel(i)
            ) : (
              // 기본: RenderTexture로 패널 렌더링
              <group ref={(el) => { if (el) contentRefs.current[i] = el; }}>
                <mesh
                  onPointerEnter={() => setHoveredPanel(i)}
                  onPointerLeave={() => setHoveredPanel(null)}
                >
                  {/* 패널 지오메트리 (RT 비율에 맞춤) */}
                  {(() => {
                    const aspect = rtWidth / rtHeight;
                    const h = lockPanelToRTAspect ? panelW / aspect : panelH;
                    return <boxGeometry args={[panelW, h, 0.08]} />;
                  })()}
                  
                  {/* RenderTexture를 맵으로 사용하는 머터리얼 */}
                  <meshBasicMaterial toneMapped={false}>
                    <RenderTexture
                      attach="map"
                      width={Math.max(1, Math.floor(rtWidth * gl.getPixelRatio()))}
                      height={Math.max(1, Math.floor(rtHeight * gl.getPixelRatio()))}
                      samples={rtSamples}
                      anisotropy={rtAnisotropy}
                    >
                      {/* RT 내부 배경색 */}
                      <color attach="background" args={["#1b1b1b"]} />
                      
                      {/* RT 내부 카메라 */}
                      <PerspectiveCamera
                        makeDefault
                        fov={60}
                        position={[0, 0, 5]}
                        onUpdate={(c) => {
                          // @ts-ignore
                          c.aspect = rtWidth / rtHeight;
                          // @ts-ignore
                          c.lookAt(rtLookAt[0], rtLookAt[1], rtLookAt[2]);
                          // @ts-ignore
                          c.updateProjectionMatrix();
                        }}
                      />
                      
                      {/* RT 내부 조명 */}
                      <ambientLight intensity={0.05} />
                      
                      {/* RT 콘텐츠 (비동기 로딩 지원) */}
                      <Suspense fallback={null}>
                        {rtContent ? rtContent(i, activeIndex, hoveredPanel === i) : <Detailview />} 
                      </Suspense>
                    </RenderTexture>
                  </meshBasicMaterial>
                </mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
});

export default MeshCarousel3D;