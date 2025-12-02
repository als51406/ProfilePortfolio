/**
 * @file App.tsx
 * @description 애플리케이션의 루트 컴포넌트
 * 
 * 주요 기능:
 * - React Router를 사용한 페이지 라우팅 관리
 * - Lenis 라이브러리를 활용한 부드러운 스크롤 구현
 * - 전역 UI 컴포넌트 (GlassBubble) 렌더링
 * 
 * 라우트 구성:
 * - "/" : 홈 페이지 (3D 포트폴리오 메인)
 * - "/projects" : 프로젝트 목록 페이지
 */

import React, { useEffect } from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import GlassBubble from './assets/Liquidglass';
import HomeProjects from './pages/HomeProjects';
import Lenis from 'lenis';




function App() {
  /**
   * Lenis 스무스 스크롤 초기화
   * 
   * Lenis는 부드러운 스크롤 경험을 제공하는 라이브러리
   * - smoothWheel: 마우스 휠 스크롤 부드럽게
   * - lerp: 선형 보간 계수 (0~1, 낮을수록 부드러움)
   * - duration: 스크롤 애니메이션 지속 시간
   * 
   * requestAnimationFrame을 사용해 매 프레임 업데이트
   * 컴포넌트 언마운트 시 정리(cleanup)
   */
  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.1,
      duration: 1.2
    });

    let rafId: number;
    // RAF(Request Animation Frame) 루프 - 매 프레임마다 Lenis 업데이트
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // 클린업: 컴포넌트 언마운트 시 RAF 취소 및 Lenis 인스턴스 제거
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      {/* 페이지 라우팅 설정 */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<HomeProjects />} />
      </Routes>
      
      {/* 전역 UI: 유리 버블 효과 (모든 페이지에서 표시) */}
      <GlassBubble />
    </>
  );
}

export default App;