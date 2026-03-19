export interface Donation {
  id: number;
  name: string;
  category: string;
  topic: string;
  method: string[];
  description: string;
  link: string;
  imageUrl: string;
}

export const donationData: Donation[] = [
  {
    id: 1,
    name: "세이브더칠드런",
    category: "NGO",
    topic: "아동/청소년",
    method: ["정기후원", "일시후원"],
    description: "전 세계 아동의 권리와 생존을 위해 활동하는 국제 구호개발 NGO입니다.",
    link: "https://www.sc.or.kr/",
    imageUrl: "https://via.placeholder.com/300x200?text=Save+the+Children"
  },
  {
    id: 2,
    name: "그린피스",
    category: "국제기구",
    topic: "환경보호",
    method: ["정기후원", "일시후원", "캠페인참여"],
    description: "지구 환경 보호와 평화를 위해 행동하는 독립적인 국제 환경단체입니다.",
    link: "https://www.greenpeace.org/korea/",
    imageUrl: "https://via.placeholder.com/300x200?text=Greenpeace"
  },
  {
    id: 3,
    name: "동물권행동 카라",
    category: "소규모 단체",
    topic: "동물권",
    method: ["정기후원", "물품기부", "봉사활동"],
    description: "모든 동물이 생명으로서 존중받는 세상을 만들기 위해 활동합니다.",
    link: "https://www.ekara.org/",
    imageUrl: "https://via.placeholder.com/300x200?text=KARA"
  },
  {
    id: 4,
    name: "초록우산 어린이재단",
    category: "NGO",
    topic: "아동/청소년",
    method: ["정기후원"],
    description: "어린이가 행복한 세상을 만들기 위해 아동 복지 사업을 수행합니다.",
    link: "https://www.childfund.or.kr/",
    imageUrl: "https://via.placeholder.com/300x200?text=ChildFund"
  },
  {
    id: 5,
    name: "국경없는의사회",
    category: "국제기구",
    topic: "긴급구호",
    method: ["정기후원", "일시후원"],
    description: "의료 지원이 부족한 지역에 긴급 구호 활동을 펼치는 단체입니다.",
    link: "https://msf.or.kr/",
    imageUrl: "https://via.placeholder.com/300x200?text=MSF"
  },
  {
    id: 6,
    name: "아름다운재단",
    category: "기업재단",
    topic: "독거노인",
    method: ["정기후원", "재능기부"],
    description: "우리 사회의 사각지대에 있는 이웃들을 위한 나눔을 실천합니다.",
    link: "https://beautifulfund.org/",
    imageUrl: "https://via.placeholder.com/300x200?text=Beautiful+Fund"
  }
];
