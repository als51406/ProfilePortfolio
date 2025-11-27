import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Introduction from './Introduction';
import PillNav from '../assets/PillNav';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
// router link not needed here because PillNav renders Link internally


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

const Header: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showAbout, setShowAbout] = useState(false);
    // Projects는 라우팅으로 이동하므로 별도 모달 상태 불필요

    const handleAboutClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowAbout(true);
    };
    // const handleProjectsClick = () => {};
    const handleCloseAbout = () => setShowAbout(false);
    // const handleCloseProjects = () => {};

    return (
        <div id='headerWrap'>
                        <header>
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
                        <div className='email-event'>
                             <a href="mailto:als51406@gmail.com" className="email-box" aria-label="Send email">
                            als51406@gmail.com
                            </a>
                        </div>
            <div className='wave'>
                {/* 파동치는 원형 라인 효과 */}
                <div className="wave-container" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>

            {createPortal(
                <AnimatePresence>
                    {showAbout && (
                        <motion.div
                            style={modalStyle}
                            onClick={handleCloseAbout}
                            role="dialog"
                            aria-modal="true"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                        >
                            <motion.div //콘텐츠 박스 애니메이션( 이 값을 조정하면 됨 )
                                style={modalContentStyle}
                                onClick={e => e.stopPropagation()}
                                initial={{ opacity: 0, y: 60, x: 0 }}
                                animate={{ opacity: 1, y: 0, x :0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.24, ease: 'easeOut' }}
                            >
                                <button style={closeBtnStyle} onClick={handleCloseAbout} aria-label="Close">×</button>
                                <Introduction />
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Projects는 별도 페이지로 이동하므로 모달 제거 */}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default Header;
