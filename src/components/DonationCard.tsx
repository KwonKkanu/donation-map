import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import type { Donation } from '@/data/donations';

export default function DonationCard({ donation }: { donation: Donation }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group">
      <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={donation.imageUrl} 
          alt={donation.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            {donation.category}
          </span>
          <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            {donation.topic}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
          {donation.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
          {donation.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {donation.method.map((m, idx) => (
            <span key={idx} className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-md font-medium border border-blue-100">
              #{m}
            </span>
          ))}
        </div>
        
        <Link 
          href={donation.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-auto flex items-center justify-center gap-2 w-full py-3 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 font-semibold rounded-xl transition-colors border border-gray-200 hover:border-emerald-200"
        >
          단체 홈페이지 방문 <ExternalLink size={16} />
        </Link>
      </div>
    </div>
  );
}
