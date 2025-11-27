import React, { useState, useEffect, useRef } from "react";
import "../styles/liquidglass.css";

const GlassBubble: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [bubblePosition, setBubblePosition] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // 부드러운 따라가기 애니메이션
  useEffect(() => {
    const animate = () => {
      setBubblePosition((prev) => {
        const dx = mousePosition.x - prev.x;
        const dy = mousePosition.y - prev.y;

        // 이징 함수 - 거리에 따라 속도 조절
        const ease = 0.8; // 훨씬 더 빠르게 따라오도록 증가 (0.3 → 0.5)

        return {
          x: prev.x + dx * ease,
          y: prev.y + dy * ease,
        };
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePosition]);

  return (
    <div
      className="glass-bubble"
      style={{
        left: bubblePosition.x,
        top: bubblePosition.y,
      }}
    />
  );
};

export default GlassBubble;
