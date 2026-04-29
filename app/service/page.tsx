// 이 페이지는 브라우저(클라이언트)에서 즉각적으로 반응(로딩 상태 등)하도록 하기 위해 선언합니다.
'use client'; 

import { useEffect, useState } from 'react';

// 기부 캠페인 데이터의 생김새(형식)를 미리 약속해둡니다. (TypeScript 기능)
interface Campaign {
  id?: string;         // 고유 아이디
  title: string;       // 기부 제목
  url: string;         // 클릭 시 넘어갈 상세페이지 링크
  platform?: string;   // 플랫폼 이름 (예: 카카오, 해피빈)
  category?: string;   // 환경, 아동 등 분야
  thumbUrl?: string;   // 썸네일 이미지 주소
  orgName?: string;    // 주관 단체 이름
}

// 메인 기부 검색 화면 (기존 main_service.html 대체)
export default function ServicePage() {
  // 컴포넌트의 상태(State) 3가지를 관리합니다.
  // 1. campaigns: API에서 가져온 실제 기부 목록 데이터 창고
  // 2. loading: 지금 데이터를 창고에서 꺼내오는 중인지 알려주는 상태
  // 3. error: 데이터를 가져오다 문제가 생겼을 때 메시지를 담는 곳
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 화면이 사용자에게 '처음' 렌더링될 때 딱 한 번 실행되는 조립 라인(파이프라인)입니다!
  useEffect(() => {
    // 백엔드 창고(/api/campaigns)에 "데이터 좀 주세요" 하고 요청(요청)합니다.
    fetch('/api/campaigns')
      .then((res) => {
        if (!res.ok) throw new Error('백엔드에서 데이터를 불러오지 못했습니다.');
        return res.json();
      })
      .then((data) => {
        // 성공적으로 데이터를 받으면 JSON 구조에 맞춰 목록을 빼옵니다.
        // 데이터 구조가 { items: [...] } 일 수도 있고 그냥 배열 [...] 일 수도 있으므로 방어 코드를 짰습니다.
        const items = data.items || data || [];
        setCampaigns(items);
        setLoading(false); // 로딩이 끝났음을 알립니다.
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false); // 에러가 나도 로딩은 끝내야 합니다.
      });
  }, []); // 끝에 있는 빈 배열([])이 '처음 렌더링될 때 딱 한 번만'을 의미합니다.

  return (
    <div className="max-w-6xl mx-auto mt-12 px-4 mb-20">
      {/* 상단 소개 텍스트 영역 */}
      <header className="mb-12">
        <h2 className="text-3xl font-extrabold mb-2 text-gray-900">기부처 찾기</h2>
        <p className="text-gray-600 text-lg">원하는 카테고리를 선택해 신뢰할 수 있는 플랫폼을 확인하세요.</p>
      </header>

      {/* 상태 1: 로딩 중일 때 사용자에게 보여줄 친절한 안내 문구 */}
      {loading && (
        <div className="text-center py-20 text-blue-500 font-bold text-xl animate-pulse">
          데이터 파이프라인에서 정성껏 수집된 기부 정보를 가져오고 있습니다...
        </div>
      )}

      {/* 상태 2: 에러가 났을 때 보여줄 가이드 문구 */}
      {error && (
        <div className="text-center py-20 border-2 border-dashed border-red-300 rounded-xl bg-red-50">
          <p className="text-red-600 font-bold mb-2">통신에 문제가 발생했습니다: {error}</p>
          <p className="text-gray-500 text-sm">터미널에서 크롤링 로직 코드를 한 번 실행하여 창고를 채워주시거나, 백엔드 연결을 다시 확인해주세요.</p>
        </div>
      )}

      {/* 상태 3: 데이터가 성공적으로 렌더링 될 때 보여질 카드 목록 리스트 */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {campaigns.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-20 border border-gray-200 rounded-2xl">
              현재 시스템 파이프라인에 담긴 캠페인이 없습니다.
            </div>
          ) : (
            // 배열에 들어있는 기부 데이터를 바탕으로 카드를 반복(Map)해서 그려냅니다.
            campaigns.map((campaign, idx) => (
              <a 
                key={campaign.id || idx} // 리스트 렌더링을 위한 고유 키값
                href={campaign.url || '#'} 
                target="_blank" 
                rel="noreferrer"
                className="block bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col group"
              >
                {/* 썸네일 영역 */}
                <div className="h-52 bg-gray-50 relative overflow-hidden">
                  {campaign.thumbUrl ? (
                    <img 
                      src={campaign.thumbUrl} 
                      alt={campaign.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                       <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                       <span className="text-xs">이미지 없음</span>
                     </div>
                  )}
                  {/* 플랫폼 표시 태그 (데이터가 있으면 렌더링) */}
                  <span className="absolute top-3 left-3 px-3 py-1 bg-white/95 text-blue-800 text-xs font-extrabold rounded-lg shadow-sm">
                    {campaign.platform || '기부플랫폼'}
                  </span>
                </div>
                
                {/* 하단 텍스트 정보 영역 */}
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-xs font-semibold text-blue-500 mb-2 tracking-wider">
                    {campaign.category || '기타 카테고리'}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2 leading-snug">
                    {campaign.title || '제목 없음'}
                  </h3>
                  
                  {/* 주관 단체 등 추가 정보 (카드가 길어져도 아래쪽에 고정되도록 mt-auto 사용) */}
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500 line-clamp-1 font-medium">
                      {campaign.orgName || '상세페이지 참조'}
                    </span>
                    <span className="text-gray-300 group-hover:text-blue-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </span>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}
