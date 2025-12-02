/**
 * @file Home.tsx
 * @description 홈 페이지 컴포넌트
 * 
 * 라우트: /
 * 
 * 구성 요소:
 * - Header: 상단 네비게이션 및 로고
 * - MainView: 3D 캐러셀과 배경이 있는 메인 뷰어
 * - SkillsSphere: 3D 스킬 구체 애니메이션
 */

import React from 'react';
import Header from '../components/Header';
import MainView from '../components/MainView';
import SkillsSphere from '../components/SkillsSphere';

const Home: React.FC = () => (
  <>
    {/* 헤더 (네비게이션, 로고, About 모달) */}
    <Header />
    
    {/* 메인 3D 뷰어 (캐러셀, 배경 모델, 타이틀) */}
    <MainView/>
    
    {/* 3D 스킬 구체 섹션 */}
    <SkillsSphere/>
  </>
);

export default Home;
