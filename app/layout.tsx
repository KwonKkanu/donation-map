import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

// 웹페이지의 메타 정보(탭 이름, 사이트 설명 등)를 정의합니다.
// 기존 html의 <head> 안에 들어가던 <title>과 <meta> 역할을 합니다.
export const metadata: Metadata = {
  title: 'Donation Map - 기부지도',
  description: '세상의 모든 기부를 한눈에. 기부 큐레이션 플랫폼',
};

// RootLayout은 모든 페이지를 감싸는 가장 큰 뼈대(틀)입니다.
// 기존 html의 <html> 태그와 <body> 태그, 공통 헤더/푸터 역할을 여기서 한 번에 처리합니다.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      {/* 화면 배경색과 텍스트의 기본 색상, 웹폰트 등을 지정합니다. 화면 꽉 채우기(min-h-screen) 레이아웃 적용 */}
      <body className="bg-gray-50 text-gray-900 font-sans antialiased flex flex-col min-h-screen">
        
        {/* 네비게이션(헤더) 바 - 모든 페이지에서 공통으로 최상단에 보여집니다. */}
        <nav className="p-6 bg-white shadow-sm flex justify-between items-center sticky top-0 z-50">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-2xl font-bold text-blue-600">Donation Map</h1>
          </Link>
          <Link href="/service" 
            className="inline-block px-6 py-2 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all duration-300 text-sm">
            기부 지도 보러가기
          </Link>
        </nav>

        {/* 
          Main 콘텐츠 영역. 
          여기에 위치한 {children}에 각 페이지(page.tsx)의 내용물이 쏙 들어가게 됩니다. 
        */}
        <main className="flex-grow">
          {children}
        </main>

        {/* 푸터 영역 - 모든 페이지 하단에 공통으로 보여집니다. */}
        <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-gray-400 text-sm">© 2026 Donation Map Project. 세상을 바꾸는 작은 실천.</p>
          </div>
        </footer>

      </body>
    </html>
  );
}
