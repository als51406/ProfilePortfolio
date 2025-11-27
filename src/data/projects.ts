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
    title: '프로젝트 제목 1',
    description: '프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다',
    image: 'https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58',
    link: 'https://example.com',
    altText: 'Kendrick Lamar - GNX Album Cover',
    scaleOnHover: 1.17
  },
  {
    id: 2,
    title: '프로젝트 제목 2',
    description: '프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다',
    image: 'https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58',
    link: 'https://example.com',
    altText: 'Kendrick Lamar - GNX Album Cover',
    scaleOnHover: 1.2
  },
  {
    id: 3,
    title: '프로젝트 제목 3',
    description: '프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다',
    image: 'https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58',
    link: 'https://example.com',
    altText: 'Kendrick Lamar - GNX Album Cover',
    scaleOnHover: 1.2
  },
  {
    id: 4,
    title: '프로젝트 제목 4',
    description: '프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다',
    image: 'https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58',
    link: 'https://example.com',
    altText: 'Kendrick Lamar - GNX Album Cover',
    scaleOnHover: 1.2
  },
  {
    id: 5,
    title: '프로젝트 제목 5',
    description: '프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다 프로젝트 설명입니다',
    image: 'https://i.scdn.co/image/ab67616d0000b273d9985092cd88bffd97653b58',
    link: 'https://example.com',
    altText: 'Kendrick Lamar - GNX Album Cover',
    scaleOnHover: 1.2
  }
];
