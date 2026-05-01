"use client";

import React, { useState } from 'react';
import { supabase } from '../../lib/db'; 

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleLogin = async (provider: 'google' | 'kakao') => {
    setIsLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('로그인 에러:', error);
      alert('로그인 중 문제가 발생했습니다. 시스템 상태를 확인해 주세요.');
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden p-10 text-center border border-gray-100 transform transition-all">
        
        {/* 로고 및 타이틀 영역 */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">MONEYGUARD</h1>
          <p className="text-gray-500 font-medium leading-relaxed">
            대표님, 3초 만에 로그인하고<br/>
            우리 기업에 숨겨진 정부지원금을 찾아보세요.
          </p>
        </div>


        

        {/* 소셜 로그인 버튼 영역 */}
        <div className="space-y-4">
          
          <button
            onClick={() => handleLogin('kakao')}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center py-4 px-4 bg-[#FEE500] hover:bg-[#FDD800] text-[#000000] font-black rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {isLoading === 'kakao' ? '보안 연결 중...' : '💬 카카오로 3초 만에 시작하기'}
          </button>

          <button
            onClick={() => handleLogin('google')}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center py-4 px-4 bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-black rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {isLoading === 'google' ? '보안 연결 중...' : 'G Google 계정으로 계속하기'}
          </button>

        </div>
        
        <p className="mt-8 text-[11px] text-gray-400 font-medium">
          로그인 시 YM Studio의 이용약관 및 개인정보처리방침에 동의하게 됩니다.
        </p>

      </div>
    </div>
  );
}