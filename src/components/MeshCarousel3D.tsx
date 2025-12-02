import React, { useMemo, useRef, forwardRef, useImperativeHandle, useEffect, Suspense, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useDrag } from '@use-gesture/react';
import { RenderTexture, PerspectiveCamera } from '@react-three/drei';
import gsap from 'gsap';
import Detailview from '../assets/Detailview';

type RenderPanel = (index: number) => React.ReactNode;

type Props = {
  count: number;
  radius?: number;
  y?: number;
  panelW?: number;   // 시각적 폭(메쉬/Html 기준)
  panelH?: number;   // 시각적 높이
  sensitivity?: number; // 라디안/픽셀
  focusScale?: number;  // 정면 패널 강조 배율
  inertia?: boolean;    // 릴리즈 후 관성 회전
  friction?: number;    // 관성 감쇠(0~1)
  inertiaScale?: number;// 제스처 속도를 각속도로 매핑
  snap?: boolean;       // 릴리즈 후 슬롯 스냅
  renderPanel?: RenderPanel; // 커스텀 3D 패널 렌더
  facing?: 'camera' | 'center' | 'world'; // 드래그 중에도 패널 방향 고정 방식
  positions?: Array<[number, number, number]>; // 각 메쉬의 기본 로컬 포지션(미지정 시 원형 배치)
  enableDrag?: boolean; // 드래그 비활성화 옵션
  slotScales?: number[]; // 각 슬롯의 스케일 (positions 제공 시 사용)
  // 중앙 패널 RenderTexture 해상도/품질 제어
  rtWidth?: number;   // 텍스처 가로 해상도(px)
  rtHeight?: number;  // 텍스처 세로 해상도(px)
  rtSamples?: number; // MSAA 샘플 수 (WebGL2)
  rtAnisotropy?: number; // 비등방성 필터링
  lockPanelToRTAspect?: boolean; // 중앙 패널 기하를 RT 종횡비(예: 16:9)에 맞춤
  rtLookAt?: [number, number, number]; // RT 카메라가 바라볼 타겟(기본 원점)
  hoverScale?: number; // 호버 시 추가 배율(콘텐츠 그룹에 곱셈)
  // RenderTexture 내부 콘텐츠를 패널별로 지정 (activeIndex, isHovered 전달)
  rtContent?: (index: number, activeIndex: number, isHovered: boolean) => React.ReactNode;
  // 패널 클릭 핸들러 (패널 인덱스 전달)
  onPanelClick?: (index: number) => void;
  // 인덱스 변경 콜백
  onIndexChange?: (index: number) => void;
    
};

export type MeshCarousel3DHandle = {
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  getIndex: () => number;
};

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
  const groupRef = useRef<THREE.Group>(null!);
  const panelRefs = useRef<THREE.Group[]>([]);
  const contentRefs = useRef<THREE.Group[]>([]);
  const hoverFlags = useRef<boolean[]>(Array.from({ length: count }, () => false));
  const { gl, camera } = useThree();

  const step = useMemo(() => (Math.PI * 2) / count, [count]);

  // 상태(Ref)
  const angle = useRef(0);        // 현재 회전 각도(라디안, 무한)
  const vel = useRef(0);          // 관성 각속도
  const dragging = useRef(false); // 드래그 중 여부
  const over = useRef(false);     // 캐러셀 위에 커서 있는지
  const snapTarget = useRef<number | null>(null);
  const lastDx = useRef(0);
  const currentIndex = useRef(0);
  const panelSlot = useRef<number[]>(Array.from({ length: count }, (_, i) => i % count)); // panel i -> slot index
  
  // 활성 인덱스 상태 (React state로 관리하여 리렌더링 트리거)
  const [activeIndex, setActiveIndex] = useState(0);
  
  // 호버 상태 (패널별로 관리)
  const [hoveredPanel, setHoveredPanel] = useState<number | null>(null);

  const discrete = Array.isArray(positions) && positions.length >= count; // 슬롯 모드
  const slotLocals = useMemo(() => {
    if (!discrete || !positions) return [] as Array<[number, number, number]>;
    return positions.slice(0, count).map(([x, wy, z]) => [x, wy - y, z] as [number, number, number]);
  }, [discrete, positions, count, y]);
  const slotScaleVals = useMemo(() => {
    if (!discrete) return [] as number[];
    if (slotScales && slotScales.length >= count) return slotScales.slice(0, count);
    const arr = new Array(count).fill(1);
    arr[0] = focusScale; // 앞 슬롯만 강조
    return arr;
  }, [discrete, slotScales, count, focusScale]);

  // 드래그 핸들러: Canvas DOM에 바인딩, 캐러셀 위(over.current=true)일 때만 동작
  useDrag(
    ({ down, delta: [dx], velocity: [vx], direction: [dirX], last }) => {
      if (!enableDrag || !over.current || discrete) return;

      dragging.current = down;
      if (down) {
        snapTarget.current = null;
        const delta = -dx * sensitivity;
        angle.current += delta * 0.9 + lastDx.current * 0.1;
        lastDx.current = delta;
      } else if (last) {
        if (inertia) {
          const targetVel = -dirX * vx * sensitivity * inertiaScale;
          vel.current = vel.current * 0.35 + targetVel * 0.65;
          lastDx.current = 0;
        } else if (snap) {
          const idx = Math.round(angle.current / step);
          snapTarget.current = idx * step;
        }
      }
    },
    { target: gl.domElement, filterTaps: true }
  );

  // 프레임 업데이트: 관성/스냅 처리 + 그룹 회전 적용
  useFrame(() => {
    if (!discrete) {
      // 회전 모드: 관성/스냅/그룹 회전
      if (!dragging.current && inertia && Math.abs(vel.current) > 1e-4) {
        angle.current += vel.current;
        vel.current *= friction;
        if (snap && Math.abs(vel.current) < 0.005) {
          vel.current = 0;
          const idx = Math.round(angle.current / step);
          snapTarget.current = idx * step;
        }
      }
      if (!dragging.current && snapTarget.current !== null) {
        const t = snapTarget.current;
        const diff = t - angle.current;
        angle.current += diff * 0.15;
        if (Math.abs(diff) < 1e-3) snapTarget.current = null;
      }
      if (groupRef.current) groupRef.current.rotation.y = angle.current;
      const newIndex = ((Math.round(angle.current / step) % count) + count) % count;
      if (currentIndex.current !== newIndex) {
        currentIndex.current = newIndex;
        setActiveIndex(newIndex);
        onIndexChange?.(newIndex);
      }
      currentIndex.current = newIndex;
    } else {
      // 슬롯 모드: 현재 front는 slot 0을 점유 중인 패널
      const idx = panelSlot.current.findIndex((s) => s === 0);
      const newIndex = idx >= 0 ? idx : 0;
      if (currentIndex.current !== newIndex) {
        currentIndex.current = newIndex;
        setActiveIndex(newIndex);
        onIndexChange?.(newIndex);
      }
      currentIndex.current = newIndex;
    }

    // 중앙 패널 화면-픽셀 맞춤: slot 0 패널의 콘텐츠 그룹을 원하는 픽셀(예: 1280x720)로 보이도록 스케일
    if (contentRefs.current.length) {
      const frontIdx = panelSlot.current.findIndex((s) => s === 0);
      for (let i = 0; i < contentRefs.current.length; i++) {
        const cg = contentRefs.current[i];
        if (!cg) continue;
        // 기본 타깃 스케일: 중앙 슬롯이면 픽셀-맞춤, 아니면 1
        let target = 1;
        if (discrete && i === frontIdx) {
          // 카메라 공간 z 거리 산출
          const pw = new THREE.Vector3();
          panelRefs.current[i]?.getWorldPosition(pw);
          const pw4 = new THREE.Vector4(pw.x, pw.y, pw.z, 1);
          pw4.applyMatrix4(camera.matrixWorldInverse);
          const zCam = Math.abs(pw4.z);
          const fovRad = (camera as THREE.PerspectiveCamera).fov * Math.PI / 180;
          const viewportH = window.innerHeight; // CSS px
          const desiredPxH = rtHeight; // 예: 720
          const targetWorldH = 2 * zCam * Math.tan(fovRad / 2) * (desiredPxH / viewportH);
          // 중앙 패널 기본 높이(스케일 1 기준)
          const aspect = rtWidth / rtHeight;
          const baseH = (lockPanelToRTAspect ? panelW / aspect : panelH);
          const groupScaleY = panelRefs.current[i]?.scale.y ?? 1;
          target = targetWorldH / (baseH * groupScaleY);
        }
        // 호버 배율 적용
        const hoverMul = hoverFlags.current[i] ? hoverScale : 1;
        const desired = target * hoverMul;
        // 부드럽게 보간
        const cur = cg.scale.y;
        const next = THREE.MathUtils.lerp(cur, desired, 0.2);
        cg.scale.set(next, next, next);
      }
    }

    // 패널 방향 유지(카메라/센터 기준 Y-빌보드)
    if (panelRefs.current.length) {
      const gy = groupRef.current ? groupRef.current.rotation.y : 0;
      for (let i = 0; i < panelRefs.current.length; i++) {
        const g = panelRefs.current[i];
        if (!g) continue;
        if (facing === 'world') continue; // 로컬 회전 유지
        // 월드 위치 계산
        const worldPos = new THREE.Vector3();
        g.getWorldPosition(worldPos);
        let yawTarget = 0;
        if (facing === 'camera') {
          // 카메라 방향으로 Y만 바라보게
          yawTarget = Math.atan2(camera.position.x - worldPos.x, camera.position.z - worldPos.z);
        } else if (facing === 'center') {
          // 원점(센터)을 바라보게
          yawTarget = Math.atan2(-worldPos.x, -worldPos.z);
        }
        // child.worldYaw = gy + child.localYaw = yawTarget => child.localYaw = yawTarget - gy
        g.rotation.y = yawTarget - gy;
      }
    }
  });

  // 초기 위치를 슬롯에 맞춰 세팅 (슬롯 모드)
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

  // 인덱스 정규화 헬퍼
  const normalizeIndex = (idx: number) => ((idx % count) + count) % count;

  // 특정 패널 인덱스로 이동
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
    // 슬롯 모드: targetIdx 패널이 슬롯 0(정면)에 오도록 전체 슬롯을 회전
    const currentSlotOfTarget = panelSlot.current[targetIdx] ?? 0;
    const newMap = panelSlot.current.map((s) => (s - currentSlotOfTarget + count) % count);
    panelSlot.current = newMap;
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

  const next = () => {
    if (!discrete) return goTo(currentIndex.current + 1);
    const newMap = panelSlot.current.map((s) => (s + 1) % count);
    panelSlot.current = newMap;
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
  const prev = () => {
    if (!discrete) return goTo(currentIndex.current - 1);
    const newMap = panelSlot.current.map((s) => (s - 1 + count) % count);
    panelSlot.current = newMap;
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

  useImperativeHandle(ref, () => ({ next, prev, goTo, getIndex: () => ((currentIndex.current % count) + count) % count }), [count]);

  // 정면 강조 스케일 계산
  const scaleFor = (i: number) => {
    const rel = i * step - angle.current;
    const a = Math.atan2(Math.sin(rel), Math.cos(rel)); // [-PI, PI]
    const t = 1 - Math.min(Math.abs(a) / Math.PI, 1);  // 정면=1, 후면=0
    return 1 + (focusScale - 1) * (t * t);
  };

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
      {Array.from({ length: count }).map((_, i) => {
        const base = i * step;
        const computedX = Math.sin(base) * radius;
        const computedZ = Math.cos(base) * radius;

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
            // 스케일은 슬롯 모드에서 GSAP로만 제어(초기 useEffect + 이동 애니메이션)
          >
            {/* 드래그 캡처용 투명 플레인 (Html가 있어도 이게 입력을 받음) */}
            <mesh
              position={[0, 0, 0.08]}
              onPointerOver={(e) => {
                e.stopPropagation();
                hoverFlags.current[i] = true;
                // Show pointer cursor when hovering a panel
                try { (gl.domElement as HTMLCanvasElement).style.cursor = 'pointer'; } catch {}
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                hoverFlags.current[i] = false;
                // Restore default cursor when leaving the panel
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

            {renderPanel ? (
              renderPanel(i)
            ) : (
              <group ref={(el) => { if (el) contentRefs.current[i] = el; }}>
                <mesh
                  onPointerEnter={() => setHoveredPanel(i)}
                  onPointerLeave={() => setHoveredPanel(null)}
                >
                  {(() => {
                    const aspect = rtWidth / rtHeight;
                    const h = lockPanelToRTAspect ? panelW / aspect : panelH;
                    return <boxGeometry args={[panelW, h, 0.08]} />;
                  })()}
                  <meshBasicMaterial toneMapped={false}>
                    <RenderTexture
                      attach="map"
                      width={Math.max(1, Math.floor(rtWidth * gl.getPixelRatio()))}
                      height={Math.max(1, Math.floor(rtHeight * gl.getPixelRatio()))}
                      samples={rtSamples}
                      anisotropy={rtAnisotropy}
                    >
                      <color attach="background" args={["#1b1b1b"]} />
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
                      <ambientLight intensity={0.05} />
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