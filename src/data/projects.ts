// 프로젝트 데이터 타입 정의
export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
  altText: string;
  scaleOnHover?: number;
}

// 프로젝트 데이터 배열
export const projectsData: Project[] = [
  {
    id: 1,
    title: 'Profile Portfolio',
    description: '현재 보고 있는 프로필 소개 사이트입니다. React, TypeScript, Three.js를 활용하여 현대적인 프로필 웹 사이트를 만들어보았습니다. 제 포트폴리오들을 조금이나마 생동감 있게 감상했으면 하는 마음에서 제작하게 되었습니다. GSAP 기반의 부드러운 카메라 무빙, Framer Motion의 섬세한 UI 인터랙션, 그리고 Lenis 스크롤로 몰입감 있는 사용자 경험을 구현했습니다. ',
    image: 'https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58',
    link: 'https://als51406.mycafe24.com',
    altText: 'Profile Portfolio - 현재 프로필 사이트',
    scaleOnHover: 1.17
  },
  {
    id: 2,
    title: '3D Portfolio',
    description: '@react-three/fiber와 @react-three/drei를 활용한 완전한 3D 환경의 포트폴리오입니다. 기존의 상품 페이지를 조금 더 생동감있고 인터랙티브 한 요소를 추가하여 고객에게 풍부한 경험을 제공했으면 하는 바람으로 시작하게 되었습니다. 실시간 Apple Watch 모델 렌더링, 그리고 마우스 인터랙션에 반응하는 동적 카메라 컨트롤을 통해 차별화된 웹 경험을 선사합니다. ',
    image: 'https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58',
    link: 'https://als51406.mycafe24.com/3dPortfolio',
    altText: '3D Portfolio - Three.js 기반 3D 포트폴리오',
    scaleOnHover: 1.2
  },
  {
    id: 3,
    title: '토닥톡',
    description: '팀장을 맡은 최초의 팀 프로젝트 결과물입니다. OPEN AI API를 활용하여 사용자에게 감성적인 AI 서비스를 제공하는 웹사이트를 개발하였습니다. 실제로 서비스를 이용할 수 있도록 데이터베이스 연결, api 사용을 최초로 경험해본 프로젝트입니다. 사용자들은 AI 다이어리와 실시간 채팅기능을 이용할 수 있습니다.',
    image: 'https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58',
    link: 'http://zoomedia.synology.me:7780/',
    altText: '토닥톡 - OPEN AI 를 활용한 감정기반 성장 다이어리 프로젝트',
    scaleOnHover: 1.2
  },
  {
    id: 4,
    title: '쇼핑몰 사이트 - Purfit Mall',
    description: '일반적인 쇼핑몰 사이트입니다. 웹 퍼블리싱&프론트엔드 역량을 키우기 위해 제작하였습니다. 쇼핑몰의 이름은 Purfit Mall로 Purple(세련됨의 색상, 메인컬러) + fit 을 합쳐 세련되게 식단관리 하는사람들을 위한 식단 상품 판매 사이트입니다.',
    image: 'https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58',
    link: 'http://zoomedia.synology.me:9000/',
    altText: 'Purfit Mall - shopping mall site',
    scaleOnHover: 1.2
  },
  {
    id: 5,
    title: 'MUI dashboard',
    description: '비즈니스 대시보드 웹 어플리케이션으로, 실시간 데이터 시각화 및 주요 비즈니스 지표를 한 눈에 확인할 수 있는 관리자 인터페이스입니다. React와 TypeScript 기반으로 구축되었으며, Material-UI 디자인 시스템을 활용하여 세련되고 직관적인 사용자 경험을 제공합니다.',
    image: 'https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58',
    link: 'https://als51406.mycafe24.com/mui/',
    altText: 'business data chart dashboard',
    scaleOnHover: 1.2
  }
];
