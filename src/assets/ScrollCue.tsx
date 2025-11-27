import React from 'react';
import { motion } from 'framer-motion';

type ScrollCueProps = {
  topVH?: number;          // 시작 높이(뷰포트 기준)
  stopBottomPx?: number;   // 화면 하단에서 멈출 위치(px)
  size?: number;           // 물방울 크기(px)
  duration?: number;       // 한 번 떨어지는 데 걸리는 시간(초)
  jitter?: number;         // 좌우 흔들림 정도(px)
  blur?: number;           // 최대 블러(px)
  color?: string;          // 물방울 색(그라디언트 중심색)
};

const ScrollCue: React.FC<ScrollCueProps> = ({
  topVH = 20,
  stopBottomPx = 140,
  size = 14,
  duration = 1.8,
  jitter = 16,
  blur = 1.2,
  color = 'rgba(255,255,255,0.9)'
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: `${topVH}vh`,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        zIndex: 500,
        pointerEvents: 'none'
      }}
      aria-hidden
    >
      {/* 메인 물방울 */}
      <motion.div
        initial={{ opacity: 0, y: -40, x: 0, scale: 0.9, filter: 'blur(0px)' }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: ['-40px', '60vh', `calc(100vh - ${stopBottomPx}px)`, `calc(100vh - ${stopBottomPx - 10}px)`],
          x: [0, jitter, -jitter * 0.6, 0],
          scale: [0.9, 1, 1.05, 1],
          filter: ['blur(0px)', `blur(${blur * 0.7}px)`, `blur(${blur}px)`, `blur(${blur}px)`]
        }}
        transition={{
          duration,
          ease: 'easeOut',
          repeat: Infinity,
          repeatDelay: 0.6
        }}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `radial-gradient(ellipse at 30% 30%, ${color}, rgba(180,200,255,0.35) 60%, rgba(80,120,255,0.15) 100%)`,
          boxShadow: '0 0 20px rgba(120,160,255,0.35)'
        }}
      />

      {/* 잔상 물방울(조금 뒤따라감) */}
      <motion.div
        initial={{ opacity: 0, y: -52, x: 0, scale: 0.7, filter: 'blur(0px)' }}
        animate={{
          opacity: [0, 0.6, 0.4, 0],
          y: ['-52px', '50vh', `calc(100vh - ${stopBottomPx + 28}px)`, `calc(100vh - ${stopBottomPx + 18}px)`],
          x: [0, jitter * 0.7, -jitter * 0.4, 0],
          scale: [0.7, 0.85, 0.9, 0.9],
          filter: ['blur(0px)', 'blur(1px)', `blur(${blur}px)`, `blur(${blur}px)`]
        }}
        transition={{
          duration: duration * 0.95,
          ease: 'easeOut',
          repeat: Infinity,
          repeatDelay: 0.6,
          delay: 0.15
        }}
        style={{
          width: size * 0.6,
          height: size * 0.6,
          borderRadius: '50%',
          background: `radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.85), rgba(180,200,255,0.25) 60%, rgba(80,120,255,0.1) 100%)`,
          boxShadow: '0 0 14px rgba(120,160,255,0.25)'
        }}
      />
    </div>
  );
};

export default ScrollCue;