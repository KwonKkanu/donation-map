import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '기부지도 (Donation Map)',
  description: '당신의 따뜻한 마음이 길을 잃지 않도록, 나에게 맞는 기부처 큐레이션 플랫폼.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} min-h-screen bg-gray-50 flex flex-col text-gray-900`}>
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="bg-white border-t border-gray-200 py-8 text-center text-gray-500 text-sm">
          <p>© 2026 기부지도. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
