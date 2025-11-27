import React from 'react'
import TiltedCard from '../assets/TiltedCard'
import ScrollDownCueGSAP from '../assets/Linedown'


const Projects = () => {
  return (
    <div id='projectsWrap'>
        <h4>MY PROJECTS</h4>
        <p>UX / UI <br/>
            Publishing<br/>
            Interactive Design<br/>
            3D Object Conrtol<br/>
            Front - End Develop
        </p>
        <div className='projectsView'>
            <ul>
                <li className='dropline'>
                    <ScrollDownCueGSAP height={720} color="#F0F0DD" />
                </li>

                {/* 포트폴리오 1 -  */}
                <li> 
                    <a
                        href="https://example.com" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        aria-label="Open project in new tab"
                        style={{ display: 'inline-block' }}
                    >
                    <TiltedCard
                        imageSrc="https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58"
                        altText="Kendrick Lamar - GNX Album Cover"
                        // captionText=""
                        containerHeight="375px"
                        containerWidth="675px"
                        imageHeight="375px"
                        imageWidth="675px"
                        rotateAmplitude={3}
                        scaleOnHover={1.17}
                        showMobileWarning={false}
                        showTooltip={false}
                        displayOverlayContent={true}
                        overlayContent={
                            <div className="hover-box">
                                <h5>프로젝트 제목</h5>
                                <p>프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다
                                     프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다
                                     프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다
                                     프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다</p>
                            </div>
                                }
                            />
                            </a>
                        </li>

            {/* 포트폴리오 2 -  */}
             <li>
                <a
                    href="https://example.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="Open project in new tab"
                    style={{ display: 'inline-block' }}
                >
                <TiltedCard
                    imageSrc="https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58"
                    altText="Kendrick Lamar - GNX Album Cover"
                    // captionText=""
                    containerHeight="375px"
                    containerWidth="675px"
                    imageHeight="375px"
                    imageWidth="675px"
                    rotateAmplitude={3}
                    scaleOnHover={1.2}
                    showMobileWarning={false}
                    showTooltip={false}
                    displayOverlayContent={true}
                    overlayContent={
                      <div className="hover-box">
                                <h5>프로젝트 제목</h5>
                                <p>프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다
                                     프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다
                                     프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다</p>
                            </div>
                }/></a>
            </li>

            {/* 포트폴리오 3 -  */}
             <li>
                <a
                    href="https://example.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="Open project in new tab"
                    style={{ display: 'inline-block' }}
                >
            <TiltedCard
                imageSrc="https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58"
                altText="Kendrick Lamar - GNX Album Cover"
                // captionText=""
                containerHeight="375px"
                containerWidth="675px"
                imageHeight="375px"
                imageWidth="675px"
                rotateAmplitude={3}
                scaleOnHover={1.2}
                showMobileWarning={false}
                showTooltip={false}
                displayOverlayContent={true}
                overlayContent={
                   <div className="hover-box">
                                <h5>프로젝트 제목</h5>
                                <p>프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다
                                     프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다
                                     프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다</p>
                            </div>
                }/>
                </a>
            </li>

            {/* 포트폴리오 4 -  */}
             <li>
                <a
                                href="https://example.com" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                aria-label="Open project in new tab"
                                style={{ display: 'inline-block' }}
                            >
            <TiltedCard
                imageSrc="https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58"
                altText="Kendrick Lamar - GNX Album Cover"
                // captionText=""
                containerHeight="375px"
                containerWidth="675px"
                imageHeight="375px"
                imageWidth="675px"
                rotateAmplitude={3}
                scaleOnHover={1.2}
                showMobileWarning={false}
                showTooltip={false}
                displayOverlayContent={true}
                overlayContent={
                   <div className="hover-box">
                                <h5>프로젝트 제목</h5>
                                <p>프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다
                                     프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다
                                     프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다</p>
                            </div>
                }/>
                </a>
            </li>

            {/* 포트폴리오 5 -  */}
             <li>
                <a
                                href="https://example.com" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                aria-label="Open project in new tab"
                                style={{ display: 'inline-block' }}
                            >
            <TiltedCard
                imageSrc="https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58"
                altText="Kendrick Lamar - GNX Album Cover"
                // captionText=""
                containerHeight="375px"
                containerWidth="675px"
                imageHeight="375px"
                imageWidth="675px"
                rotateAmplitude={3}
                scaleOnHover={1.2}
                showMobileWarning={false}
                showTooltip={false}
                displayOverlayContent={true}
                overlayContent={
                    <div className="hover-box">
                                <h5>프로젝트 제목</h5>
                                <p>프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다
                                     프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다
                                     프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다</p>
                            </div>
                }/>
                </a>
            </li>
</ul>



        </div>
    </div>
  )
}

export default Projects