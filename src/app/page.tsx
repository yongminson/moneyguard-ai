"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// 🚀 스크롤 시 숫자가 올라가는 카운터 컴포넌트
const CountUp = ({ end, suffix = "", duration = 2000 }: { end: number, suffix?: string, duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [isVisible, end, duration]);

  return <div ref={ref} className="text-4xl md:text-5xl font-black text-blue-600">{count.toLocaleString()}{suffix}</div>;
};

// 🚀 스크롤 시 부드럽게 나타나는 페이드인 컴포넌트
const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setIsVisible(true), delay);
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      {children}
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      
      {/* 글로벌 네비게이션 바 */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 flex items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="로고" className="h-8 w-auto rounded-md" />
          <span className="font-black text-lg tracking-tight text-gray-900">MONEYGUARD AI</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors hidden md:block">로그인</Link>
          <Link href="/login" className="text-sm font-black bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">무료 진단하기</Link>
        </div>
      </nav>

      {/* 1. 히어로(Hero) 섹션 */}
      <header className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center bg-gradient-to-b from-blue-50 to-white">
        <FadeIn>
          <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 font-black text-xs md:text-sm rounded-full mb-6 border border-blue-200 shadow-sm">
            🚀 2026 정부지원금 매칭 최적화 완료
          </div>
        </FadeIn>
        <FadeIn delay={200}>
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-6 text-gray-900">
            사장님, 올해 놓치신<br className="hidden md:block"/> <span className="text-blue-600">정부지원금이 얼마인지</span> 아시나요?
          </h1>
        </FadeIn>
        <FadeIn delay={400}>
          <p className="text-gray-500 text-sm md:text-xl font-medium mb-10 max-w-2xl leading-relaxed">
            매일 쏟아지는 복잡한 공고문, 서류 준비부터 적격성 진단까지.<br className="hidden md:block"/>
            이제 머니가드 AI가 알아서 찾아드리고 합격 전략까지 써드립니다.
          </p>
        </FadeIn>
        <FadeIn delay={600}>
          <Link href="/login" className="inline-block bg-gray-900 text-white font-black text-lg md:text-xl px-10 py-5 rounded-2xl shadow-2xl hover:bg-blue-600 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1">
            내 기업 지원금 1분 만에 무료 진단하기 👉
          </Link>
        </FadeIn>
      </header>

      {/* 2. 페인포인트(Pain Point) 섹션 */}
      <section className="py-20 bg-white px-6">
        <div className="max-w-6xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-black mb-16 text-gray-900">바쁜 사장님을 대신해 <span className="text-blue-600 border-b-4 border-blue-200">AI가 야근합니다</span></h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { icon: "📄", title: "끝도 없는 한글(HWP) 파일", desc: "읽어도 무슨 말인지 모를 공고문, AI가 핵심만 요약해 드립니다." },
              { icon: "⏳", title: "번번이 놓치는 예산 마감일", desc: "예산 소진 80% 임박 공고부터 마감 D-7 공고까지 실시간으로 알람을 드립니다." },
              { icon: "🤯", title: "야근하며 쓴 서류, 또 광탈?", desc: "심사위원이 좋아하는 핵심 키워드를 반영한 사업계획서 초안을 10초 만에 뽑아줍니다." }
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 200}>
                <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow">
                  <div className="text-4xl mb-6">{item.icon}</div>
                  <h3 className="text-xl font-black mb-3">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 소셜 프루프 (숫자로 증명) */}
      <section className="py-24 bg-gray-900 text-white px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-around items-center text-center gap-16 md:gap-0">
          <div className="space-y-3">
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">실시간 분석 중인 공고</p>
            <CountUp end={3421} suffix=" 건" />
          </div>
          <div className="w-full md:w-px h-px md:h-24 bg-gray-700"></div>
          <div className="space-y-3">
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">누적 매칭 예상액</p>
            <CountUp end={450} suffix=" 억+" />
          </div>
          <div className="w-full md:w-px h-px md:h-24 bg-gray-700"></div>
          <div className="space-y-3">
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">머니가드와 함께하는 대표님</p>
            <CountUp end={1204} suffix=" 명" />
          </div>
        </div>
      </section>

      {/* 4. 핵심 솔루션 섹션 */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-black mb-4">지원금 합격을 위한 <span className="text-blue-600">3대 무기</span></h2>
              <p className="text-gray-500 font-medium text-lg">YM Studio가 설계한 완벽한 합격 파이프라인을 경험하세요.</p>
            </FadeIn>
          </div>
          
          <div className="space-y-24">
            {/* 무기 1 */}
            <FadeIn>
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6">
                  <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black">1</div>
                  <h3 className="text-2xl md:text-3xl font-black leading-tight">우리 회사에 딱 맞는 공고만<br/>쏙쏙 뽑아주는 <span className="text-blue-600">정밀 타겟팅</span></h3>
                  <p className="text-gray-500 font-medium leading-relaxed text-lg">설립 연도, 매출 규모, 지역, 업종만 입력하세요. 머니가드 AI가 수천 개의 공고 중 우리 회사가 합격할 수 있는 공고만 필터링합니다.</p>
                </div>
                <div className="flex-1 w-full bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-inner flex items-center justify-center min-h-[300px]">
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-w-sm w-full">
                    <div className="text-xs font-bold text-red-500 mb-2">🔥 적격률 82% 예상</div>
                    <div className="font-black text-gray-800 mb-4 leading-snug">2026년 중소기업 수출 핵심품목 기술개발사업 공고</div>
                    <div className="flex justify-between items-center border-t pt-4">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">최대 7,000만 원</span>
                      <span className="text-xs text-gray-400 font-bold">D-29</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* 무기 2 */}
            <FadeIn>
              <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                <div className="flex-1 space-y-6">
                  <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black">2</div>
                  <h3 className="text-2xl md:text-3xl font-black leading-tight">10초 만에 완성되는<br/><span className="text-blue-600">사업계획서 자동 작성 AI</span></h3>
                  <p className="text-gray-500 font-medium leading-relaxed text-lg">머리 쥐어짜며 빈칸을 채우지 마세요. 지원금 주관 부처가 가장 좋아하는 핵심 키워드를 녹여내어 전문가급 초안을 즉시 만들어냅니다.</p>
                </div>
                <div className="flex-1 w-full bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-inner flex flex-col gap-4 min-h-[300px] justify-center items-center">
                   <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-200 p-4 relative overflow-hidden">
                     <div className="w-20 h-2 bg-gray-200 rounded-full mb-3"></div>
                     <div className="w-full h-2 bg-blue-100 rounded-full mb-2"></div>
                     <div className="w-3/4 h-2 bg-blue-100 rounded-full mb-6"></div>
                     <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
                   </div>
                   <div className="bg-blue-600 text-white font-black text-sm px-6 py-3 rounded-xl shadow-lg transform -translate-y-6">📝 HWP 초안 복사 완료!</div>
                </div>
              </div>
            </FadeIn>

            {/* 무기 3 */}
            <FadeIn>
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6">
                  <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black">3</div>
                  <h3 className="text-2xl md:text-3xl font-black leading-tight">가짜 후기 차단!<br/><span className="text-blue-600">AI 모자이크 수령 인증 라운지</span></h3>
                  <p className="text-gray-500 font-medium leading-relaxed text-lg">진짜 돈을 받은 사람들의 생생한 후기와 꿀팁을 확인하세요. 개인정보는 AI가 알아서 철저하게 모자이크(블러) 처리해 드립니다.</p>
                </div>
                <div className="flex-1 w-full bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-inner flex items-center justify-center min-h-[300px]">
                  <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 max-w-sm w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs">🏢</div>
                      <div>
                        <div className="text-xs font-bold text-gray-800">손** 대표님</div>
                        <div className="text-[10px] text-gray-400">방금 전</div>
                      </div>
                    </div>
                    <div className="w-full h-16 bg-gray-200 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden">
                       <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
                       <span className="z-10 text-[10px] font-black bg-white/80 px-2 py-1 rounded text-gray-600">AI 개인정보 보호 완료 🧾</span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">머니가드 AI 덕분에 지원금 합격했습니다!</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 5. 최종 액션 (Bottom CTA) */}
      <section className="py-32 bg-gradient-to-br from-blue-600 to-gray-900 text-white text-center px-6">
        <FadeIn>
          <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight">
            망설임의 시간을 확신으로.<br/>
            더 이상 지원금을 남의 이야기로 두지 마세요.
          </h2>
          <p className="text-blue-100 text-lg md:text-xl font-medium mb-12">YM Studio가 사장님의 비즈니스 스케일업을 지원합니다.</p>
          <Link href="/login" className="inline-block bg-white text-gray-900 font-black text-xl px-12 py-6 rounded-2xl shadow-2xl hover:bg-gray-100 hover:shadow-white/20 transition-all transform hover:-scale-105">
            지금 바로 AI 진단 시작하기 🚀
          </Link>
        </FadeIn>
      </section>

      {/* 푸터 */}
      <footer className="w-full bg-white text-gray-500 py-10 px-6 border-t border-gray-200 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div><h4 className="font-black text-gray-800 text-sm mb-3">MONEYGUARD AI</h4><p className="leading-relaxed">망설임의 시간을 확신으로.<br/>AI 기반 정부지원금 정밀 분석 서비스.</p></div>
            <div><h4 className="font-bold text-gray-700 mb-3">서비스</h4><ul className="space-y-2"><li><Link href="/" className="hover:text-blue-600 transition-colors">메인 홈</Link></li><li><Link href="/login" className="hover:text-blue-600 transition-colors">실시간 매칭 진단</Link></li></ul></div>
            <div><h4 className="font-bold text-gray-700 mb-3">고객지원 및 약관</h4><ul className="space-y-2"><li><a href="#" className="hover:text-blue-600 transition-colors">이용약관</a></li><li><a href="#" className="font-bold text-gray-800 hover:text-blue-600 transition-colors">개인정보처리방침</a></li><li><a href="#" className="hover:text-blue-600 transition-colors">환불정책</a></li></ul></div>
            <div><h4 className="font-bold text-gray-700 mb-3">제휴 및 고지</h4><p className="text-[11px] leading-relaxed text-gray-400">MONEYGUARD AI는 인공지능 기반 분석 정보를 제공할 뿐, 최종 선택과 결제에 대한 책임은 사용자 본인에게 있습니다.</p></div>
          </div>
          <div className="pt-6 border-t border-gray-100 text-[11px] text-gray-400 flex flex-col items-center md:items-start gap-2">
            <div className="flex flex-wrap justify-center md:justify-start gap-x-3 gap-y-1"><span>상호명 : 와이엠 스튜디오 (YM Studio)</span><span className="hidden md:inline">|</span><span>대표 : 손용민</span><span className="hidden md:inline">|</span><span>사업자등록번호 : 510-21-21827</span><span className="hidden md:inline">|</span><span>통신판매업신고 : 통신판매업 신고 진행 중</span></div>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-3 gap-y-1"><span>고객센터 : 0507-1385-9994</span><span className="hidden md:inline">|</span><span>이메일 : support@ymstudio.co.kr</span><span className="hidden md:inline">|</span><span>사업장 소재지 : 충청남도 아산시 둔포면 운교길129번길 14-71, 402호(노블레스타운 2차)</span></div>
            <p className="mt-4 w-full text-center md:text-left">© 2026 YM Studio & MONEYGUARD AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}