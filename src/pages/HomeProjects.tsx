/**
 * @file HomeProjects.tsx
 * @description 프로젝트 목록 페이지 컴포넌트
 * 
 * 라우트: /projects
 * 
 * 구성 요소:
 * - Header: 상단 네비게이션 및 로고
 * - Projects: 프로젝트 카드 목록 (TiltedCard 사용)
 */

import React from 'react'
import Header from '../components/Header'
import Projects from '../components/Projects'

const HomeProjects = () => {
  return (
    <>
      {/* 헤더 (네비게이션, 로고, About 모달) */}
      <Header/>
      
      {/* 프로젝트 목록 (TiltedCard 카드들) */}
      <Projects/>
    </>
  )
}

export default HomeProjects