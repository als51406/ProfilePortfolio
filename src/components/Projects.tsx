/**
 * @file Projects.tsx
 * @description 프로젝트 목록 컴포넌트
 * 
 * 주요 기능:
 * - 프로젝트 데이터(projects.ts)를 기반으로 카드 목록 렌더링
 * - TiltedCard 컴포넌트로 3D 틸트 효과가 있는 프로젝트 카드 표시
 * - ScrollDownCueGSAP으로 스크롤 유도 애니메이션
 * - 각 카드 클릭 시 해당 프로젝트 URL로 새 탭 열기
 * 
 * 사용 위치:
 * - HomeProjects 페이지 (/projects 라우트)
 */

import React from 'react';
import TiltedCard from '../assets/TiltedCard';
import ScrollDownCueGSAP from '../assets/Linedown';
import { projectsData } from '../data/projects';

const Projects: React.FC = () => {
  return (
    <div id='projectsWrap'>
      {/* 섹션 제목 */}
      <h4>MY PROJECTS</h4>
      
      {/* 프로젝트 카테고리 태그 */}
      <p>
        UX / UI <br/>
        Publishing<br/>
        Interactive Design<br/>
        3D Object Control<br/>
        Front - End Develop
      </p>
      
      <div className='projectsView'>
        <ul>
          {/* ==================== 스크롤 유도 애니메이션 ==================== */}
          {/* 수직 라인이 아래로 내려가는 애니메이션 */}
          <li className='dropline'>
            <ScrollDownCueGSAP height={720} color="#F0F0DD" />
          </li>

          {/* ==================== 프로젝트 카드 목록 ==================== */}
          {/* projectsData 배열을 map으로 순회하여 TiltedCard 렌더링 */}
          {projectsData.map((project) => (
            <li key={project.id}>
              {/* 프로젝트 링크 (새 탭에서 열기) */}
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${project.title} in new tab`}
                style={{ display: 'inline-block' }}
              >
                {/* TiltedCard: 마우스 움직임에 따라 3D 틸트 효과 */}
                <TiltedCard
                  imageSrc={project.image}
                  altText={project.altText}
                  containerHeight="375px"
                  containerWidth="675px"
                  imageHeight="375px"
                  imageWidth="675px"
                  rotateAmplitude={3}
                  scaleOnHover={project.scaleOnHover || 1.2}
                  showMobileWarning={false}
                  showTooltip={false}
                  displayOverlayContent={true}
                  overlayContent={
                    // 호버 시 표시되는 오버레이 콘텐츠
                    <div className="hover-box">
                      <h5>{project.title}</h5>
                      <p>{project.description}</p>
                    </div>
                  }
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Projects;