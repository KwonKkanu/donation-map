'use client';

import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { donationData } from '@/data/donations';
import DonationCard from '@/components/DonationCard';

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedTopic, setSelectedTopic] = useState<string>('전체');
  const [selectedMethod, setSelectedMethod] = useState<string>('전체');

  const categories = ['전체', ...Array.from(new Set(donationData.map(d => d.category)))];
  const topics = ['전체', ...Array.from(new Set(donationData.map(d => d.topic)))];
  const methods = ['전체', ...Array.from(new Set(donationData.flatMap(d => d.method)))];

  const filteredData = useMemo(() => {
    return donationData.filter((don) => {
      const matchSearch = don.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          don.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === '전체' || don.category === selectedCategory;
      const matchTopic = selectedTopic === '전체' || don.topic === selectedTopic;
      const matchMethod = selectedMethod === '전체' || don.method.includes(selectedMethod);
      
      return matchSearch && matchCat && matchTopic && matchMethod;
    });
  }, [searchTerm, selectedCategory, selectedTopic, selectedMethod]);

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center animate-fade-in-up">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">기부처 탐색</h1>
          <p className="text-lg text-gray-600">내 관심사와 방식에 맞는 기부 단체를 찾아보세요.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4 flex-shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold text-lg border-b border-gray-100 pb-4">
                <Filter size={20} className="text-emerald-500" />
                필터 옵션
              </div>

              <div className="mb-8 relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">검색어</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="단체명, 키워드 검색" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 placeholder-gray-400"
                  />
                  <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">단체 유형</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === cat 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">기부 주제</label>
                <div className="flex flex-wrap gap-2">
                  {topics.map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTopic(t)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedTopic === t 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">기부 방식</label>
                <div className="flex flex-wrap gap-2">
                  {methods.map(m => (
                    <button
                      key={m}
                      onClick={() => setSelectedMethod(m)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedMethod === m 
                        ? 'bg-rose-500 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="lg:w-3/4">
            <div className="mb-6 flex justify-between items-center text-gray-600">
              <span className="font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 text-sm">
                총 <strong className="text-emerald-600 text-base">{filteredData.length}</strong>개의 단체가 있습니다.
              </span>
            </div>

            {filteredData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredData.map(donation => (
                  <DonationCard key={donation.id} donation={donation} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100 mt-20">
                <div className="text-gray-400 mb-4 flex justify-center">
                  <Search size={48} className="opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">검색 결과가 없습니다</h3>
                <p className="text-gray-500">다른 키워드나 필터 조건을 적용해보세요.</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('전체');
                    setSelectedTopic('전체');
                    setSelectedMethod('전체');
                  }}
                  className="mt-6 px-6 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  필터 초기화
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
