// src/components/ScrollDownCueGSAP.tsx
import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

type Props = {
  height?: number;        // px length of the line
  thickness?: number;     // px width of the line
  color?: string;         // line & dot color
  trackColor?: string;    // faint background track
  duration?: number;      // seconds for one fall
  delay?: number;         // seconds between loops
  className?: string;     // extra wrapper classes
  text?: string;          // label text
  glow?: boolean;         // add a soft glow around the dot/line
};

export default function ScrollDownCueGSAP({
  height = 64,
  thickness = 2,
  color = '#F0F0DD',
  trackColor = 'rgba(240,240,221,0.35)',
  duration = 1.1,
  delay = 0.6,
  className,
  text = 'Scroll Down',
  glow = false,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lineFillRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: delay,
        defaults: { ease: 'power2.out' },
      });

      gsap.set(lineFillRef.current, { height: 0, opacity: 1 });
      gsap.set(dotRef.current, { y: 0, opacity: 0, scale: 0.6 });
      gsap.set(labelRef.current, { y: 0, opacity: 0.9 });

      // appear
      tl.to(dotRef.current, { opacity: 1, duration: 0.2 }, 0);

      // fall + line grow
      tl.to(
        dotRef.current,
        { y: height - 8, scale: 1, duration },
        0
      );
      tl.to(
        lineFillRef.current,
        { height, duration, ease: 'power1.inOut' },
        0
      );

      // tiny nudge on label at impact
      tl.to(
        labelRef.current,
        { y: 3, duration: 0.18, ease: 'sine.out' },
        duration - 0.08
      );
      tl.to(
        labelRef.current,
        { y: 0, duration: 0.25, ease: 'sine.in' },
        '>'
      );

      // fade out and reset
      tl.to([dotRef.current, lineFillRef.current], { opacity: 0, duration: 0.2 }, '>-0.05');
      tl.set(dotRef.current, { y: 0, opacity: 0, scale: 0.6 });
      tl.set(lineFillRef.current, { height: 0, opacity: 1 });
    }, rootRef);

    return () => ctx.revert();
  }, [height, duration, delay]);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none',
        gap: 10,
        zIndex: 5,
      }}
    >
      {/* Line */}
      <div
        style={{
          position: 'relative',
          width: thickness,
          height,
          borderRadius: thickness / 2,
          background: trackColor, // track
          overflow: 'hidden',
        }}
      >
        {/* Fill that grows */}
        <div
          ref={lineFillRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: thickness,
            height: 0,
            background: color,
            borderRadius: thickness / 2,
            boxShadow: glow ? `0 0 12px ${color}` : 'none',
          }}
        />
        {/* Falling dot */}
        <div
          ref={dotRef}
          style={{
            position: 'absolute',
            top: 0,
            left: -Math.max(0, (8 - thickness) / 2 + 1),
            width: Math.max(8, thickness * 3),
            height: Math.max(8, thickness * 3),
            borderRadius: 999,
            background: color,
            filter: glow
              ? `drop-shadow(0 0 10px ${color}) drop-shadow(0 4px 12px rgba(0,0,0,0.35))`
              : 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
          }}
        />
      </div>

      {/* Label */}
      <div
        ref={labelRef}
        style={{
          fontSize: 12,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color,
          userSelect: 'none',
          textShadow: glow ? `0 0 6px ${color}` : 'none',
        }}
      >
        {text}
      </div>
    </div>
  );
}