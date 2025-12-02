import React from 'react'

const Introduction = () => {
  return (
    <div id='introductionWrap'>
        <h2>ABOUT ME</h2>
        <div className='introduction'>
            <section className='intro-profile'>
                    <div className='profile-view'>
                        <div className='profile-img'></div>
                        <div className='profile-text'>
                            <p>사용자 경험에 생동감을 불어넣는<br/><strong>인터랙티브 웹 디자이너</strong>입니다.<br/>React, Three.js, GSAP의 다양한 기술 경험으로<br/>몰입감 있는 웹 경험을 설계합니다.</p>
                        </div>
                    </div>
            </section>
            <section className='intro-skill'>
                <div className='skill-view'>
                    <div className='skills'>
                        <h3>SKILL
                            <svg width="214" height="4" viewBox="0 0 214 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 2H214" stroke="#C5C5C5" stroke-width="3"/>
                            </svg>    
                        </h3>
                        <div><p>REACT</p>
                        <p>TYPESCRIPT</p></div>
                        <div><p>THREE.JS</p>
                        <p>HTML5</p></div>
                        <div> <p>CSS3</p>
                        <p>FIGMA</p></div>
                        <div> <p>BLENDER</p>
                        <p>ADOBE PHOTOSHOP</p></div>
                        <div><p>ADOBE PREMIERE PRO</p>
                        <p>AUTO CAD 2D</p></div>
                        {/* <p>REACT</p>
                        <p>TYPESCRIPT</p>
                        <p>TRHEE.JS</p>
                        <p>HTML5</p>
                        <p>CSS3</p>
                        <p>FIGMA</p>
                        <p>BLENDER</p>
                        <p>ADOBE PHOTOSHOP</p>
                        <p>ADOBE PREMIERE PRO</p>
                        <p>AUTO CAD 2D</p> */}
                    </div>
                    <div className='license'>
                        <h3>LICENSE
                           <svg width="190" height="4" viewBox="0 0 169 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 2L169 2.00001" stroke="#C5C5C5" stroke-width="3"/>
                            </svg>
                        </h3>
                        <p>GTQ 포토샵 자격증 1급</p>
                        <p>자동차 운전면허 1종 보통</p>
                    </div>
                    <div className='education'>
                        <h3>EDUCATION
                             <svg width="135" height="3" viewBox="0 0 135 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 1.49998L135 1.5" stroke="#C5C5C5" stroke-width="3"/>
                            </svg>
                        </h3>
                        <p>한국 IT 교육원 UI UX 웹 디자인 과정 수료</p>
                        <p>Unity 클래스 scene 컨트롤부터 AI연동 과정 수료</p>
                        <p>생성형 AI를 활용한 입문자용 Unity 게임 콘텐츠 제작 과정</p>
                        <p>2024 메타버스 허브 스쿨 기획 부트캠프</p>
                        <p>2024 메타버스 허브 스쿨 스킬업 과정 수료</p>
                        <p>2024 메타버스 허브 스쿨 유니티를 활용한 3D 콘텐츠 개발 수료</p>
                        <p>2023 메타버스 실감형 콘텐츠 기술 및 제작기법 이해 교육 수료</p>
                       

                    </div>
                    <div className='projects'>
                        <h3>PROJECT
                           <svg width="190" height="4" viewBox="0 0 169 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 2L169 2.00001" stroke="#C5C5C5" stroke-width="3"/>
                            </svg>
                        </h3>
                        <p>동북권 메타버스 경진대회 개발부문 - 우수상</p>
                        <p>Kit 우수 강의 에세이 공모전 - 우수상</p>
                        <p>VisionOS를 이용한 메타버스 콘텐츠 앱 개발</p>
                        <p>2024 구미시 라면축제 스마트 플레이 큐브 체험존 운영</p>
                        <p>캡스톤 디자인 공모전 "텀블러가 부착된 전기포트" - 특허 등록</p>
                        <p>한국 IT 교육원 인터랙티브 3D 웹사이트 디자인 및 개발 </p>
                        <p>교내 텀 프로젝트 -<br/> "똑똑한 점심 앱 UI 개발", "인간공학적 소화기 디자인",<br/> "헬스케어 AI 강아지 서비스 개발"</p>

                    </div>
                </div>
            </section>
        </div> 
    </div>
  )
}

export default Introduction