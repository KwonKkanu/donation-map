// 랜딩 페이지 (기존 index.html 대체)
// 사이트(Domain)에 접속했을 때 가장 먼저 보여지는 대문 페이지입니다.

export default function Home() {
  return (
    // 중앙에 내용을 예쁘게 정렬하기 위한 메인 화면 컨테이너 영역입니다.
    <div className="max-w-4xl mx-auto mt-20 text-center px-4">
      {/* 큼지막한 타이틀 */}
      <h2 className="text-4xl font-extrabold mb-4">세상의 모든 기부를 한눈에.</h2>
      
      {/* 사이트 서브타이틀 및 부가 설명 */}
      <p className="text-xl text-gray-600 mb-8">
        신뢰할 수 있는 기부 플랫폼을 큐레이션하여 연결해 드립니다.
      </p>
      
      {/* 예쁜 그림자(shadow-xl)가 들어간 하얀색 카드 영역 */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <p className="text-gray-500 italic">
          "위의 [기부 지도 보러가기] 버튼을 통해 큐레이션 지도를 만나보실 수 있습니다."
        </p>
        
        {/* 핵심 키워드 태그(Hash Tag) 영역 - 예쁜 배지(Badge) 형태 */}
        <div className="mt-6 flex justify-center gap-4">
          <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            #신뢰도검증
          </span>
          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            #기부큐레이션
          </span>
        </div>
      </div>
    </div>
  );
}
