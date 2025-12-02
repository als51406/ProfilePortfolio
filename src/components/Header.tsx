/**
 * @file Header.tsx
 * @description 웹사이트 헤더 컴포넌트
 * 
 * 주요 기능:
 * - 로고/타이틀 (클릭 시 홈으로 이동)
 * - PillNav 네비게이션 메뉴 (HOME, PROJECTS, ABOUT)
 * - 이메일 연락처 표시
 * - 파동 애니메이션 효과 (wave)
 * - About 모달 (React Portal + Framer Motion)
 * 
 * 모달 구현:
 * - createPortal로 body에 렌더링 (z-index 문제 해결)
 * - AnimatePresence로 마운트/언마운트 애니메이션
 * - 배경 클릭 시 모달 닫기
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Introduction from './Introduction';
import PillNav from '../assets/PillNav';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

// ============================================================
// 모달 스타일 정의
// ============================================================

/** 모달 오버레이 스타일 (배경) */
const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(30, 34, 54, 0.32)',
    backdropFilter: 'blur(18px) saturate(180%)',
    WebkitBackdropFilter: 'blur(18px) saturate(180%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9000,
    overflow: 'hidden',
    transition: 'background 0.3s',
};

/** 모달 콘텐츠 박스 스타일 */
const modalContentStyle: React.CSSProperties = {
    background: 'rgba(239, 239, 239, 1)',
    borderRadius: 28,
    padding: '40px 32px 32px 32px',
    width:"1290px",
    height:"660px",
    overflow: 'hidden',
    color: '#1d1d1d',
    boxShadow: '0 8px 40px 0 rgba(31,38,135,0.18), 0 1.5px 8px rgba(255,255,255,0.10) inset',
    position: 'relative',
    border: '1.5px solid rgba(255,255,255,0.22)',
    outline: '1.5px solid rgba(31,38,135,0.08)',
    backdropFilter: 'blur(12px) saturate(180%)',
    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
    transition: 'box-shadow 0.3s, background 0.3s'
};

/** 모달 닫기 버튼 스타일 */
const closeBtnStyle: React.CSSProperties = {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 40,
    height: 40,
    background: 'rgba(255,255,255,0.18)',
    border: 'none',
    borderRadius: '50%',
    color: '#222',
    fontSize: 28,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(31,38,135,0.10)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
};

// ============================================================
// Header 컴포넌트
// ============================================================
const Header: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // About 모달 표시 상태
    const [showAbout, setShowAbout] = useState(false);

    /**
     * About 클릭 핸들러
     * - 기본 링크 동작 방지 후 모달 표시
     */
    const handleAboutClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowAbout(true);
    };
    
    /** About 모달 닫기 */
    const handleCloseAbout = () => setShowAbout(false);

    return (
        <div id='headerWrap'>
            <header>
                {/* ==================== 로고/타이틀 ==================== */}
                {/* 클릭 시 홈으로 이동, 키보드 접근성 지원 */}
                <h1
                    onClick={() => navigate('/')}
                    style={{ color: location.pathname === '/projects' ? '#e8e8e8' : undefined, cursor: 'pointer' }}
                    role="link"
                    tabIndex={0}
                    aria-label="홈으로 이동"
                    onKeyDown={(e) => { 
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate('/');
                        }
                    }}
                >
                    Design Profile
                </h1>
                
                {/* ==================== 네비게이션 메뉴 ==================== */}
                {/* PillNav: 알약 모양의 애니메이션 네비게이션 */}
                <PillNav
                    items={[
                        { label: 'HOME', href: '/' },
                        { label: 'PROJECTS', href: '/projects' },
                        { label: 'ABOUT', href: '#', onClick: handleAboutClick },
                    ]}
                    activeHref={location.pathname}
                    className="custom-nav"
                    ease="power2.easeOut"
                    baseColor="#F0F0DD"
                    pillColor="#000000"
                    hoveredPillTextColor="#000000"
                    pillTextColor="#F0F0DD"
                />
            </header>
            
            {/* ==================== 이메일 연락처 ==================== */}
            <div className='email-event'>
                <a href="mailto:als51406@gmail.com" className="email-box" aria-label="Send email">
                    als51406@gmail.com
                </a>
            </div>
            
            {/* ==================== 파동 애니메이션 효과 ==================== */}
            {/* 원형 라인이 퍼져나가는 애니메이션 (CSS로 구현) */}
            <div className='wave'>
                <div className="wave-container" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>

            {/* ==================== About 모달 (React Portal) ==================== */}
            {/* createPortal로 body에 직접 렌더링하여 z-index 문제 해결 */}
            {createPortal(
                <AnimatePresence>
                    {showAbout && (
                        <motion.div
                            style={modalStyle}
                            onClick={handleCloseAbout}  // 배경 클릭 시 닫기
                            role="dialog"
                            aria-modal="true"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                        >
                            {/* 모달 콘텐츠 박스 */}
                            <motion.div
                                style={modalContentStyle}
                                onClick={e => e.stopPropagation()}  // 콘텐츠 클릭 시 닫기 방지
                                initial={{ opacity: 0, y: 60, x: 0 }}
                                animate={{ opacity: 1, y: 0, x :0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.24, ease: 'easeOut' }}
                            >
                                {/* 닫기 버튼 */}
                                <button style={closeBtnStyle} onClick={handleCloseAbout} aria-label="Close">×</button>
                                
                                {/* Introduction 컴포넌트 (자기소개 내용) */}
                                <Introduction />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default Header;
