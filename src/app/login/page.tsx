"use client";

import React, { useState } from 'react';
// 우리가 만든 Supabase 통신 장비를 불러옵니다.
import { supabase } from '../../lib/db'; 

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // 카카오/구글 로그인 버튼을 눌렀을 때 실행되는 마법의 함수입니다.
  const handleLogin = async (provider: 'google' | 'kakao') => {
    setIsLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          // 로그인 성공 후 아까 만든 대시보드 화면으로 자동 이동시킵니다.
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('로그인 에러:', error);
      alert('로그인 중 문제가 발생했습니다. 다시 시도해주세요.');
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center border border-gray-100">
        
        {/* 로고 및 타이틀 영역 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MoneyGuard AI 🛡️</h1>
          <p className="text-gray-500">
            대표님, 3초 만에 로그인하고<br/>
            우리 가게 숨은 정부지원금을 찾아보세요.
          </p>
        </div>

        {/* 소셜 로그인 버튼 영역 */}
        <div className="space-y-3">
          
          {/* 카카오 로그인 버튼 */}
          <button
            onClick={() => handleLogin('kakao')}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center py-4 px-4 bg-[#FEE500] hover:bg-[#FDD800] text-[#000000] font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {isLoading === 'kakao' ? '연결 중...' : '💬 카카오로 3초 만에 시작하기'}
          </button>

          {/* 구글 로그인 버튼 */}
          <button
            onClick={() => handleLogin('google')}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center py-4 px-4 bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {isLoading === 'google' ? '연결 중...' : 'G Google 계정으로 계속하기'}
          </button>

        </div>
        
        <p className="mt-8 text-xs text-gray-400">
          로그인 시 YM Studio의 이용약관 및 개인정보처리방침에 동의하게 됩니다.
        </p>

      </div>
    </div>
  );
}