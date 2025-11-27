import React from 'react';
import TiltedCard from '../assets/TiltedCard';
import ScrollDownCueGSAP from '../assets/Linedown';
import { projectsData } from '../data/projects';

const Projects: React.FC = () => {
  return (
    <div id='projectsWrap'>
      <h4>MY PROJECTS</h4>
      <p>
        UX / UI <br/>
        Publishing<br/>
        Interactive Design<br/>
        3D Object Control<br/>
        Front - End Develop
      </p>
      <div className='projectsView'>
        <ul>
          <li className='dropline'>
            <ScrollDownCueGSAP height={720} color="#F0F0DD" />
          </li>

          {/* 프로젝트 데이터를 map으로 렌더링 */}
          {projectsData.map((project) => (
            <li key={project.id}>
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${project.title} in new tab`}
                style={{ display: 'inline-block' }}
              >
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