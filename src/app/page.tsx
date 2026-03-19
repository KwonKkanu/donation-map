import Link from "next/link";
import { ArrowRight, Heart, Search, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white pt-24 pb-32">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center container">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6 animate-fade-in-up">
            <span className="block text-emerald-600 mb-2 text-2xl md:text-3xl font-semibold opacity-90">당신의 따뜻한 마음이 길을 잃지 않도록,</span>
            기부지도
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto font-medium mb-10">
            넘쳐나는 정보 속에서 어떤 단체를 믿고 기부해야 할지 망설이셨나요?
            <br className="hidden md:block"/>
            테마별 맞춤 큐레이션을 통해 나에게 딱 맞는 기부처를 찾아보세요.
          </p>
          <div className="flex justify-center">
            <Link 
              href="/explore" 
              className="group flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              기부처 탐색하기 
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features / Intro Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">왜 기부지도인가요?</h2>
            <p className="text-gray-600">투명하고 확실한 정보로 기부의 첫걸음을 돕습니다.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 text-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Search size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">맞춤형 탐색</h3>
              <p className="text-gray-600 leading-relaxed">
                관심 있는 주제(아동, 환경 등)와 기부 방식에 따라 나에게 맞는 단체를 직관적으로 찾아볼 수 있습니다.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-md transition-shadow">
              <div className="bg-emerald-100 text-emerald-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">신뢰할 수 있는 단체</h3>
              <p className="text-gray-600 leading-relaxed">
                검증되고 투명하게 운영되는 주요 NGO 및 기구들을 한눈에 모아 비교하고 선택할 수 있습니다.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-md transition-shadow">
              <div className="bg-rose-100 text-rose-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Heart size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">손쉬운 기부 연결</h3>
              <p className="text-gray-600 leading-relaxed">
                복잡한 과정 없이 마음에 드는 단체의 공식 홈페이지로 바로 연결되어 손쉽게 기부에 동참할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
