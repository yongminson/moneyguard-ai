"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/db'; 
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'matching' | 'lounge'>('matching');

  const [businessNumber, setBusinessNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [region, setRegion] = useState("");
  const [industry, setIndustry] = useState("");
  const [mainItem, setMainItem] = useState("");
  const [establishedYear, setEstablishedYear] = useState("");
  const [revenueScale, setRevenueScale] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [grants, setGrants] = useState<any[]>([]);
  const [isFetchingGrants, setIsFetchingGrants] = useState(true);

  const [aiResult, setAiResult] = useState<any>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [selectedGrantTitle, setSelectedGrantTitle] = useState("");
  const [editableValues, setEditableValues] = useState<{[key: string]: string}>({});
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{sender: 'ai'|'user', text: string}[]>([
    { sender: 'ai', text: '안녕하세요! YM Studio AI 지원금 컨설턴트입니다. 서비스 이용 중 궁금한 점이 있으신가요?' }
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStep, setUploadStep] = useState(0); 
  const [uploadGrantName, setUploadGrantName] = useState("");
  const [uploadAmount, setUploadAmount] = useState("");
  const [uploadTip, setUploadTip] = useState("");

  const [loungePosts, setLoungePosts] = useState([
    { id: 1, user: "테크*** 사장님", grant: "기술혁신형 중소기업 지원", amount: "5,000만원", date: "1시간 전", text: "머니가드 AI 덕분에 서류 광탈에서 벗어났습니다!", likes: 24, hasImage: true },
    { id: 2, user: "YM*** 대표님", grant: "창업중심대학 지원사업", amount: "7,000만원", date: "3시간 전", text: "지역 매칭 기능이 진짜 신의 한 수네요. 충남 지역 최고!", likes: 12, hasImage: false }
  ]);

  const router = useRouter();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  useEffect(() => {
    if (window.location.hash.includes('access_token')) {
      window.history.replaceState(null, '', window.location.pathname);
    }

    const checkUserAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      setUser(session.user);

      const { data: profileData } = await supabase.from('business_profiles').select('*').eq('id', session.user.id).single();
      if (!profileData || !profileData.business_number || !profileData.revenue_scale) {
        if (profileData) {
          setCompanyName(profileData.company_name || ""); setRegion(profileData.region || "");
          setIndustry(profileData.industry || ""); setMainItem(profileData.main_item || "");
          setBusinessNumber(profileData.business_number || "");
        }
        setShowProfileModal(true);
      } else {
        setProfile(profileData);
      }

      try {
        const res = await fetch('/api/grants');
        const grantData = await res.json();
        if (grantData.success) setGrants(grantData.data || []);
      } catch (error) { console.error(error); } finally { setIsFetchingGrants(false); }
    };
    checkUserAndFetchData();
  }, [router]);

  const handleSaveProfile = async () => {
    if (!businessNumber || !companyName || !region || !industry || !mainItem || !establishedYear || !revenueScale || !employeeCount) return alert("모든 정보를 입력해야 정밀 진단이 가능합니다!");
    setIsSaving(true);
    const { error } = await supabase.from('business_profiles').upsert({
      id: user.id, business_number: businessNumber, company_name: companyName, region, industry, 
      main_item: mainItem, established_year: establishedYear, revenue_scale: revenueScale, employee_count: employeeCount
    });

    if (!error) {
      setProfile({ business_number: businessNumber, company_name: companyName, region, industry, main_item: mainItem, established_year: establishedYear, revenue_scale: revenueScale, employee_count: employeeCount });
      setShowProfileModal(false);
    }
    setIsSaving(false);
  };

  const handleGenerateDoc = async (grant: any) => {
    if (!profile) return;
    setIsLoadingDoc(true);
    setSelectedGrantTitle(grant.title);
    setAiResult(null); 
    setEditableValues({}); 
    
    if (window.innerWidth < 768) {
      setTimeout(() => { document.getElementById('analysis-section')?.scrollIntoView({ behavior: 'smooth' }); }, 500);
    }
    
    try {
      const response = await fetch("/api/generate-doc", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: profile.company_name, region: profile.region, industry: profile.industry, mainItem: profile.main_item,
          establishedYear: profile.established_year, revenueScale: profile.revenue_scale, employeeCount: profile.employee_count,
          policyName: grant.title, policyDetail: grant.dataContents 
        })
      });
      const data = await response.json();
      
      if (data.success) {
        const text = data.result;
        const parts = text.split(/\[섹션 \d:.*?\]/);
        const scoreMatch = text.match(/예상_적격률:\s*(\d+)/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;

        setAiResult({
          diagnosis: parts[1] ? parts[1].replace(/예상_적격률:.*\n?/g, '').trim() : "", score,
          simulation: parts[2] ? parts[2].trim() : "", strategy: parts[3] ? parts[3].trim() : "",
          keywords: parts[4] ? parts[4].trim() : "", draft: parts[5] ? parts[5].trim() : text
        });
      }
    } catch (error) { alert("서버 연결 실패"); }
    setIsLoadingDoc(false);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userInput = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userInput }]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'ai', text: '죄송합니다. 현재 AI 컨설턴트 베타 테스트 중입니다. 긴급한 문의는 support@ymstudio.co.kr 로 부탁드립니다!' }]);
    }, 800);
  };

  const handleUploadSubmit = () => {
    if (!uploadGrantName || !uploadAmount) return alert("지원금 이름과 수령액을 적어주세요!");
    
    setUploadStep(1); 
    setTimeout(() => {
      setUploadStep(2); 
      setTimeout(() => {
        const rawName = profile?.company_name || '익명';
        const maskedName = rawName.length > 0 ? rawName.charAt(0) + '**' : '익**';
        
        const newPost = {
          id: Date.now(),
          user: `${maskedName} 대표님`,
          grant: uploadGrantName,
          amount: uploadAmount,
          date: "방금 전",
          text: uploadTip || "머니가드 AI로 합격했습니다! 감사합니다.",
          likes: 0,
          hasImage: true 
        };
        
        setLoungePosts([newPost, ...loungePosts]); 
        setShowUploadModal(false);
        setUploadStep(0);
        
        setUploadGrantName("");
        setUploadAmount("");
        setUploadTip("");
        
        alert("안전하게 블러 처리되어 게시글이 등록되었습니다!");
      }, 1500);
    }, 2500);
  };

  const handleLikeClick = (id: number) => {
    setLoungePosts(posts => 
      posts.map(post => 
        post.id === id ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const getDDay = (endDate: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { text: "마감", color: "text-gray-400 bg-gray-100" };
    if (diff <= 7) return { text: `D-${diff}`, color: "text-red-600 bg-red-100 font-bold" };
    return { text: `D-${diff}`, color: "text-blue-600 bg-blue-50 font-bold" };
  };

  const getBudgetAlarm = (index: number) => {
    const ratios = [82, 45, 91, 12, 78]; 
    const ratio = ratios[index % 5];
    if (ratio >= 80) return { text: `⏳ 예산 소진 ${ratio}% 임박!`, color: "text-red-600 animate-pulse" };
    return null;
  };

  const getEstimatedAmount = (title: string) => {
    if (title.includes("기술")) return "최대 7,000만 원";
    if (title.includes("협력")) return "최대 5,000만 원";
    if (title.includes("글로벌")) return "최대 1.2억 원";
    return "최대 3,000만 원";
  };

  const getPreviewBadge = (title: string, contents: string, userIndustry: string) => {
    const fullText = (title + " " + contents).toLowerCase();
    let estScore = 50;
    if (fullText.includes(userIndustry?.toLowerCase()?.slice(0,2) || "")) estScore += 30;
    if (fullText.includes("소상공인") || fullText.includes("중소기업")) estScore += 10;
    if (estScore >= 80) return { text: `🔥 적격률 ${estScore}% 예상`, color: "text-red-500" };
    return { text: `⚠️ 적격률 ${estScore}% 예상`, color: "text-orange-500" };
  };

  const renderEditableDraft = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\[빈칸:.*?\])/g);
    return parts.map((part, index) => {
      if (part.startsWith('[빈칸:')) {
        let cleanStr = part.replace(/\[빈칸:/, '').replace(/\]$/, '').replace(/추천값?:?/g, '').trim();
        const options = cleanStr.split('/').map(opt => opt.trim()).filter(Boolean);
        const fieldId = `field-${index}`;
        return (
          <select key={index} value={editableValues[fieldId] || ""} onChange={(e) => setEditableValues({...editableValues, [fieldId]: e.target.value})} className="inline text-blue-600 font-bold bg-blue-50 border-b border-blue-400 cursor-pointer outline-none appearance-none text-center mx-[2px] transition-colors" style={{ padding: '0 2px', height: 'auto', lineHeight: 'normal' }}>
            <option value="">👇선택({options[0]})</option>
            {options.map((opt, i) => (<option key={i} value={opt}>{opt}</option>))}
          </select>
        );
      }
      const textParts = part.split(/(\[[^\]]+\])/g);
      return (
        <span key={index}>
          {textParts.map((tPart, tIdx) => {
            if (tPart.startsWith('[') && tPart.endsWith(']')) {
              return (<span key={tIdx} className="block mt-5 mb-1 font-black text-blue-700 text-[13px] md:text-sm">{tPart}</span>);
            }
            return <span key={tIdx}>{tPart}</span>;
          })}
        </span>
      );
    });
  };

  const handleCopy = () => {
    if (!aiResult?.draft) return;
    const parts = aiResult.draft.split(/(\[빈칸:.*?\])/g);
    let finalDraft = parts.map((part: string, index: number) => {
      if (part.startsWith('[빈칸:')) { return editableValues[`field-${index}`] || "____"; }
      return part;
    }).join('');
    finalDraft = finalDraft.replace(/(?<!\n)(\[[^\]]+\])/g, '\n\n$1\n').trim();
    navigator.clipboard.writeText(finalDraft);
    alert("선택값이 적용된 사업계획서가 복사되었습니다!");
  };

  // 🚀 [추가] HWP 자동 생성 및 다운로드 함수
  const handleDownloadHWP = () => {
    if (!aiResult?.draft) return alert("먼저 진단하기를 눌러 사업계획서 초안을 생성해 주세요!");

    // 화면에 선택된 빈칸 값들을 텍스트로 결합
    const parts = aiResult.draft.split(/(\[빈칸:.*?\])/g);
    let finalDraft = parts.map((part: string, index: number) => {
      if (part.startsWith('[빈칸:')) { return editableValues[`field-${index}`] || "____"; }
      return part;
    }).join('');

    // 웹의 줄바꿈을 문서용 줄바꿈으로 변환
    finalDraft = finalDraft.replace(/\n/g, '<br/>');

    // 한글(HWP) 프로그램이 인식할 수 있는 문서 껍데기(스타일) 씌우기
    const documentContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>사업계획서 초안</title>
      </head>
      <body style="font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; line-height: 1.8; color: #000;">
        <h1 style="text-align: center; color: #1e3a8a; font-size: 24px;">${selectedGrantTitle} 사업계획서</h1>
        <hr style="border: solid 1px #000; margin-bottom: 20px;" />
        <div style="margin-bottom: 30px; font-size: 14px;">
          <b>▪ 기업명 :</b> ${profile?.company_name || '기업명 미상'}<br/>
          <b>▪ 작성일 :</b> ${new Date().toLocaleDateString()}<br/>
        </div>
        <div style="font-size: 15px;">
          ${finalDraft}
        </div>
        <br/><br/><br/>
        <hr style="border: dashed 1px #ccc;" />
        <div style="text-align: center; color: #888; font-size: 12px; margin-top: 10px;">
          본 문서는 <b>MONEYGUARD (YM Studio)</b>의 정밀 진단 시스템에 의해 자동 생성된 초안입니다.<br/>
          실제 제출 시 주관기관의 공식 양식(서식)에 맞게 텍스트를 복사하여 활용하시기 바랍니다.
        </div>
      </body>
      </html>
    `;

    // 브라우저에서 즉시 파일로 구워내서 다운로드 실행
    const blob = new Blob(['\uFEFF' + documentContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `[MONEYGUARD] ${profile?.company_name || '사업계획서'}_초안.hwp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center text-gray-500">인증 확인 중... 🛡️</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col md:h-screen md:overflow-hidden relative">
      
      <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity cursor-pointer">
            <img src="/logo.jpeg" alt="로고" className="h-7 md:h-9 w-auto" />
            <div className="h-4 w-[1px] bg-gray-300 mx-1 md:mx-2"></div>
            <span className="font-black text-lg tracking-tight text-gray-900">MONEYGUARD</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs md:text-sm font-bold text-blue-600 truncate max-w-[120px] md:max-w-none bg-blue-50 px-3 py-1 rounded-full">{profile?.company_name || '대표님'}</span>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="text-[10px] md:text-xs text-gray-400 font-bold hover:text-red-500 cursor-pointer transition-colors">로그아웃</button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        
        <section className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 bg-white md:overflow-y-auto custom-scrollbar flex flex-col">
          <div className="flex border-b sticky top-0 bg-white z-20 shadow-sm">
            <button onClick={() => setActiveTab('matching')} className={`flex-1 py-4 text-sm font-black transition-all ${activeTab === 'matching' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-400 hover:text-gray-600 bg-gray-50'}`}>🔔 실시간 공고</button>
            <button onClick={() => setActiveTab('lounge')} className={`flex-1 py-4 text-sm font-black transition-all ${activeTab === 'lounge' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-400 hover:text-gray-600 bg-gray-50'}`}>🏆 수령인증 라운지</button>
          </div>

          <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'matching' ? (
              <div className="space-y-4">
                <div className="p-2 mb-2"><p className="text-[10px] md:text-xs text-gray-400">YM Studio님을 위한 정밀 분석 리스트</p></div>
                {isFetchingGrants ? (
                  <div className="text-center py-10 text-gray-400 text-sm">데이터 수신 중...</div>
                ) : grants.map((grant, i) => {
                  const dday = getDDay(grant.applicationEndDate);
                  const badge = getPreviewBadge(grant.title, grant.dataContents, profile?.industry);
                  const budgetAlarm = getBudgetAlarm(i);
                  const amount = getEstimatedAmount(grant.title);
                  return (
                    <div key={i} className={`p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all shadow-sm ${selectedGrantTitle === grant.title ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-300 bg-white'}`} onClick={() => setSelectedGrantTitle(grant.title)}>
                      <div className="flex justify-between items-start mb-2">
                        <div className={`text-[10px] md:text-[11px] font-black ${badge.color}`}>{badge.text}</div>
                        {budgetAlarm && <div className={`text-[10px] md:text-[11px] font-black ${budgetAlarm.color}`}>{budgetAlarm.text}</div>}
                      </div>
                      <h3 className="font-bold text-sm mb-3 text-gray-800 leading-snug">{grant.title}</h3>
                      <div className="mb-4 flex items-center gap-2">
                        <span className="text-[9px] md:text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-black">수령 예상액</span>
                        <span className="text-sm md:text-base font-black text-blue-700">{amount}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-100">
                        <span className={`text-[10px] md:text-[11px] px-2 py-0.5 rounded-full ${dday?.color}`}>마감일: {grant.applicationEndDate} ({dday?.text})</span>
                        <button onClick={(e) => { e.stopPropagation(); handleGenerateDoc(grant); }} className="text-[10px] md:text-[11px] font-black bg-gray-900 hover:bg-blue-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl shadow-sm cursor-pointer transition-colors">진단하기</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-4">
                  <h4 className="text-sm font-black text-blue-800 mb-1">🎉 축하합니다!</h4>
                  <p className="text-[11px] text-blue-600">선정 소식을 공유하고 사장님들과 정보를 나눠보세요.</p>
                </div>
                
                {loungePosts.map((post) => (
                  <div key={post.id} className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-[10px]">🏢</div>
                        <span className="text-xs font-bold text-gray-800">{post.user}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{post.date}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl mb-3 border border-gray-100">
                      <p className="text-[10px] text-blue-600 font-bold mb-1 truncate">{post.grant}</p>
                      <p className="text-xs font-black text-gray-900">수령 확정액: <span className="text-blue-700">{post.amount}</span></p>
                    </div>
                    <p className="text-xs text-gray-600 mb-4 leading-relaxed">{post.text}</p>
                    
                    {post.hasImage && (
                      <div className="relative w-full h-24 mb-4 bg-gray-200 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
                        <div className="absolute inset-0 bg-white opacity-40 filter blur-sm"></div>
                        <div className="z-10 flex flex-col items-center">
                           <span className="text-2xl mb-1">🧾</span>
                           <span className="text-[10px] text-gray-600 font-black bg-white/80 px-2 py-1 rounded-md backdrop-blur-md">AI 개인정보 블러 처리 완료</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleLikeClick(post.id)}
                        className="flex-1 py-2 text-[11px] font-bold bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 border border-gray-200 transition-colors"
                      >
                        👏 축하하기 {post.likes > 0 && `(${post.likes})`}
                      </button>
                      <button 
                        onClick={() => alert("Vercel 정식 배포 후 카카오톡 공유 기능이 활성화됩니다!")} 
                        className="flex-1 py-2 text-[11px] font-bold bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 border border-gray-200 transition-colors"
                      >
                        🔗 공유
                      </button>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => setShowUploadModal(true)} 
                  className="w-full py-4 border-2 border-dashed border-blue-300 text-blue-500 text-xs font-black rounded-2xl hover:bg-blue-50 hover:border-blue-500 transition-all bg-white shadow-sm"
                >
                  + 영수증 인증글 올리기
                </button>
              </div>
            )}
          </div>
        </section>

        <section id="analysis-section" className="w-full md:flex-1 bg-gray-50 md:overflow-y-auto flex flex-col custom-scrollbar">
          <div className="flex-1 p-4 md:p-8 flex flex-col items-center">
            {!aiResult && !isLoadingDoc ? (
              <div className="py-20 md:h-full flex flex-col items-center justify-center text-gray-400 text-center">
                <span className="text-4xl md:text-5xl mb-4">🎯</span>
                <h2 className="font-bold text-sm md:text-lg">공고를 선택하고 [진단하기]를 누르면<br/>합격 적격률과 전략이 생성됩니다.</h2>
              </div>
            ) : isLoadingDoc ? (
              <div className="text-center py-20 md:py-32">
                <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-blue-600 font-black text-sm md:text-lg animate-pulse">정부 공고문을 정밀 분석 중입니다...</p>
              </div>
            ) : aiResult && (
              <div className="w-full max-w-3xl space-y-4 md:space-y-6 animate-fade-in pb-10">
                
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
                  <h3 className="text-xs md:text-sm font-black text-gray-800 mb-4 md:mb-6 border-b pb-2 md:pb-3">STEP 1. 적격성 진단 및 시뮬레이션</h3>
                  <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-6">
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-xs md:text-sm text-gray-700">예상 매칭 점수</span>
                        <span className="font-black text-lg md:text-xl text-blue-600">{aiResult.score}%</span>
                      </div>
                      <div className="h-3 md:h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${aiResult.score < 50 ? 'bg-red-500' : 'bg-blue-600'} transition-all duration-1000`} style={{ width: `${aiResult.score}%` }}></div>
                      </div>
                    </div>
                    <div className="w-full md:w-32 text-center p-2 md:p-3 bg-gray-50 rounded-xl border border-gray-100 flex md:flex-col justify-between items-center md:justify-center">
                      <span className="block text-[10px] text-gray-400 font-bold md:mb-1 uppercase">Result</span>
                      <span className={`font-black text-sm ${aiResult.score < 50 ? 'text-red-500' : 'text-blue-600'}`}>{aiResult.score < 50 ? '보완 필수' : '지원 가능'}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 md:p-4 rounded-xl text-xs md:text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-100 mb-4">
                    <span className="font-bold text-blue-800 block mb-2">📊 산정 근거</span>
                    {aiResult.diagnosis}
                  </div>
                  <div className="bg-yellow-50 p-3 md:p-5 rounded-xl border border-yellow-200">
                    <h4 className="text-[10px] md:text-[11px] font-black text-yellow-800 mb-2 uppercase tracking-widest">💡 적격률 상승 시뮬레이션</h4>
                    <div className="text-yellow-900 font-bold text-xs leading-relaxed whitespace-pre-wrap">{aiResult.simulation}</div>
                  </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
                  <h3 className="text-xs md:text-sm font-black text-gray-800 mb-4 md:mb-6 border-b pb-2 md:pb-3">STEP 2. 합격 전략 및 심사위원 키워드</h3>
                  <div className="bg-blue-50 p-3 md:p-5 rounded-xl border border-blue-100 mb-4">
                    <h4 className="text-[10px] md:text-[11px] font-black text-blue-800 mb-2 uppercase tracking-widest">💡 핵심 합격 코칭</h4>
                    <div className="text-blue-900 font-medium text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{aiResult.strategy}</div>
                  </div>
                  <div className="bg-gray-50 p-3 md:p-5 rounded-xl border border-gray-100">
                    <h4 className="text-[10px] md:text-[11px] font-black text-gray-600 mb-2 uppercase tracking-widest">🎯 5대 핵심 키워드</h4>
                    <div className="text-gray-800 font-bold text-xs md:text-sm leading-loose whitespace-pre-wrap">{aiResult.keywords}</div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 md:p-5 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
                    <h3 className="text-xs md:text-sm font-black text-gray-800">STEP 3. 전문가급 사업계획서 초안</h3>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button onClick={handleCopy} className="flex-1 md:flex-none px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer shadow-sm">📋 복사하기</button>
                      {/* 🚀 변경됨: 이제 경고창이 아니라 진짜 파일이 다운로드 됩니다! */}
                      <button onClick={handleDownloadHWP} className="flex-1 md:flex-none px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-md transition-transform transform hover:-translate-y-0.5">📝 HWP 다운로드</button>
                    </div>
                  </div>
                  <div className="p-4 md:p-8">
                    <div className="text-gray-700 leading-loose text-[13px] md:text-sm font-medium break-words">
                      {renderEditableDraft(aiResult.draft)}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
          
          <footer className="w-full bg-white text-gray-500 py-10 px-6 mt-auto border-t border-gray-200 text-xs">
            <div className="max-w-6xl mx-auto flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div><h4 className="font-black text-gray-800 text-sm mb-3">MONEYGUARD</h4><p className="leading-relaxed">망설임의 시간을 확신으로.<br/>정부지원금 정밀 분석 서비스.</p></div>
                <div><h4 className="font-bold text-gray-700 mb-3">서비스</h4><ul className="space-y-2"><li><a href="#" className="hover:text-blue-600 transition-colors">메인 홈</a></li><li><a href="#" className="hover:text-blue-600 transition-colors">실시간 매칭 진단</a></li></ul></div>
                <div><h4 className="font-bold text-gray-700 mb-3">고객지원 및 약관</h4><ul className="space-y-2"><li><a href="#" className="hover:text-blue-600 transition-colors">이용약관</a></li><li><a href="#" className="font-bold text-gray-800 hover:text-blue-600 transition-colors">개인정보처리방침</a></li><li><a href="#" className="hover:text-blue-600 transition-colors">환불정책</a></li></ul></div>
                <div><h4 className="font-bold text-gray-700 mb-3">제휴 및 고지</h4><p className="text-[11px] leading-relaxed text-gray-400">MONEYGUARD는 인공지능 기반 분석 정보를 제공할 뿐, 최종 선택과 결제에 대한 책임은 사용자 본인에게 있습니다.<br/><br/>정부 지원사업 선정 여부는 제출하시는 증빙 서류와 주관 기관의 기준에 따르며, 당사는 탈락에 대한 어떠한 법적 책임도 지지 않습니다.</p></div>
              </div>
              <div className="pt-6 border-t border-gray-100 text-[11px] text-gray-400 flex flex-col items-center md:items-start gap-2">
                <div className="flex flex-wrap justify-center md:justify-start gap-x-3 gap-y-1"><span>상호명 : 와이엠 스튜디오 (YM Studio)</span><span className="hidden md:inline">|</span><span>대표 : 손용민</span><span className="hidden md:inline">|</span><span>사업자등록번호 : 510-21-21827</span><span className="hidden md:inline">|</span><span>통신판매업신고 : 통신판매업 신고 진행 중</span></div>
                <div className="flex flex-wrap justify-center md:justify-start gap-x-3 gap-y-1"><span>고객센터 : 0507-1385-9994</span><span className="hidden md:inline">|</span><span>이메일 : support@ymstudio.co.kr</span><span className="hidden md:inline">|</span><span>사업장 소재지 : 충청남도 아산시 둔포면 운교길129번길 14-71, 402호(노블레스타운 2차)</span></div>
                <p className="mt-4 w-full text-center md:text-left">© 2026 YM Studio & MONEYGUARD. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </section>
      </main>

      {/* 🚀 1. 사업자 프로파일링 모달 */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-3 mb-2">
               <img src="/logo.jpeg" alt="로고" className="h-10 w-auto rounded-lg shadow-sm" />
               <h2 className="text-xl md:text-2xl font-black">합격 확률 분석 데이터 등록</h2>
            </div>
            <p className="text-gray-400 mb-4 md:mb-6 text-xs md:text-sm font-medium">YM Studio 대표님, 정보를 입력하면 정밀 진단이 시작됩니다.</p>
            <div className="space-y-3 md:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <input type="text" placeholder="사업자번호 10자리" value={businessNumber} onChange={(e) => setBusinessNumber(e.target.value)} className="p-3 md:p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm" />
                <input type="text" placeholder="설립 연도 (예: 2026)" value={establishedYear} onChange={(e) => setEstablishedYear(e.target.value)} className="p-3 md:p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <select value={revenueScale} onChange={(e) => setRevenueScale(e.target.value)} className="p-3 md:p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none cursor-pointer font-bold text-sm">
                  <option value="">연 매출 규모</option>
                  <option value="1억 미만">1억 미만</option><option value="1억~5억">1억 ~ 5억</option>
                  <option value="5억~30억">5억 ~ 30억</option><option value="30억 이상">30억 이상</option>
                </select>
                <input type="number" placeholder="직원 수 (명)" value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} className="p-3 md:p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm" />
              </div>
              <input type="text" placeholder="상호명 (YM Studio)" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full p-3 md:p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm" />
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <select value={region} onChange={(e) => setRegion(e.target.value)} className="p-3 md:p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none cursor-pointer text-sm font-bold">
                  <option value="">지역 선택</option><option value="서울">서울특별시</option><option value="경기">경기도</option><option value="인천">인천광역시</option><option value="강원">강원도</option><option value="충남">충청남도</option><option value="충북">충청북도</option><option value="대전">대전광역시</option><option value="세종">세종특별자치시</option><option value="전남">전라남도</option><option value="전북">전라북도</option><option value="광주">광주광역시</option><option value="경남">경상남도</option><option value="경북">경상북도</option><option value="부산">부산광역시</option><option value="대구">대구광역시</option><option value="울산">울산광역시</option><option value="제주">제주특별자치도</option><option value="전국">전국(해당없음)</option>
                </select>
                <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="p-3 md:p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none cursor-pointer text-sm font-bold truncate">
                  <option value="">업종 선택</option><option value="정보통신업">정보통신업 (IT/소프트웨어)</option><option value="제조업">제조업</option><option value="도매 및 소매업">도매 및 소매업</option><option value="건설업">건설업</option><option value="전문, 과학 및 기술 서비스업">전문, 과학 및 기술 서비스업</option><option value="숙박 및 음식점업">숙박 및 음식점업</option><option value="교육 서비스업">교육 서비스업</option><option value="보건 및 사회복지 서비스업">보건 및 사회복지 서비스업</option><option value="예술, 스포츠 및 여가 서비스업">예술, 스포츠 및 여가 서비스업</option><option value="기타 서비스업">기타 개인/협회 서비스업</option>
                </select>
              </div>
              <textarea placeholder="핵심 아이템 상세 설명" value={mainItem} onChange={(e) => setMainItem(e.target.value)} className="w-full p-3 md:p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none h-20 md:h-24 focus:border-blue-500 font-bold text-sm" />
              <button onClick={handleSaveProfile} disabled={isSaving} className="w-full bg-blue-600 text-white font-black py-4 md:py-5 rounded-2xl shadow-xl hover:bg-blue-700 cursor-pointer transition-all transform hover:-translate-y-1">
                {isSaving ? "동기화 중..." : "정밀 매칭 시작하기 🚀"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 2. 영수증 업로드 창 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl max-w-md w-full animate-fade-in text-center relative overflow-hidden">
            
            {uploadStep === 0 && (
              <>
                <button onClick={() => setShowUploadModal(false)} className="absolute top-4 right-5 text-gray-400 hover:text-gray-900 font-black text-xl">✕</button>
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 border border-blue-100">🧾</div>
                <h2 className="text-xl font-black mb-2 text-gray-800">수령 인증 등록</h2>
                <p className="text-xs text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="font-bold text-red-500">안심하세요!</span><br/>업로드된 영수증/입금 내역의 개인정보(이름, 계좌번호 등)는 시스템이 자동으로 스캔하여 <span className="font-bold text-gray-800">모자이크(블러) 처리</span> 후 게시됩니다.
                </p>
                <div className="space-y-3 mb-6 text-left">
                  <input type="text" value={uploadGrantName} onChange={e => setUploadGrantName(e.target.value)} placeholder="어떤 지원금을 수령하셨나요?" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm font-bold" />
                  <input type="text" value={uploadAmount} onChange={e => setUploadAmount(e.target.value)} placeholder="지원금 수령액 (예: 5,000만원)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm font-bold" />
                  <textarea value={uploadTip} onChange={e => setUploadTip(e.target.value)} placeholder="사장님만의 합격 꿀팁을 남겨주세요!" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-sm h-24 custom-scrollbar" />
                  
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <p className="text-xs font-bold text-blue-600">📁 영수증 캡쳐 이미지 업로드</p>
                    </div>
                    <input type="file" className="hidden" />
                  </label>
                </div>
                <button onClick={handleUploadSubmit} className="w-full bg-gray-900 text-white font-black py-4 rounded-xl shadow-md hover:bg-blue-600 transition-colors">
                  인증하기
                </button>
              </>
            )}

            {uploadStep === 1 && (
              <div className="py-10">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-lg font-black text-gray-800 mb-2">개인정보 보호 중...</h3>
                <p className="text-xs text-gray-500">영수증 내 민감 정보를 감지하여 모자이크 처리하고 있습니다.</p>
              </div>
            )}

            {uploadStep === 2 && (
              <div className="py-10 animate-fade-in">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 font-black">✓</div>
                <h3 className="text-lg font-black text-gray-800 mb-2">업로드 완료!</h3>
                <p className="text-xs text-gray-500">안전하게 블러 처리되어 라운지에 등록되었습니다.</p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 고객센터 챗봇 */}
      <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end">
        {isChatOpen && (
          <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl border border-gray-200 mb-4 flex flex-col overflow-hidden animate-fade-in">
            <div className="bg-blue-600 p-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <img src="/logo.jpeg" alt="로고" className="w-6 h-6 rounded-full bg-white object-contain" />
                <span className="text-white font-black text-sm">지원금 컨설턴트</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white hover:text-gray-200 font-bold">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3 custom-scrollbar">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed shadow-sm ${msg.sender === 'ai' ? 'bg-white text-gray-800 border border-gray-100 rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 bg-white border-t border-gray-100">
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="무엇이든 물어보세요..." className="flex-1 p-2 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium" />
                <button type="submit" disabled={!chatInput.trim()} className="bg-gray-900 text-white px-3 rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors disabled:opacity-50">전송</button>
              </form>
            </div>
          </div>
        )}
        
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-14 h-14 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-transform transform hover:scale-105">
          <img src="/logo.jpeg" alt="로고" className="w-8 h-8 rounded-full bg-white object-contain" />
        </button>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}