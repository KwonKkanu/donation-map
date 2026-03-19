import Link from 'next/link';
import { HeartHandshake } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-emerald-500 text-white p-2 rounded-xl group-hover:bg-emerald-600 transition-colors">
              <HeartHandshake size={24} />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">기부지도</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/explore" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">
              기부처 탐색
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
