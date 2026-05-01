"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/db'; 

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // 1. 주소창에 넘어온 로그인 정보(토큰)를 Supabase가 자동으로 인식합니다.
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // 2. 로그인이 확인되면 즉시 대시보드로 보냅니다!
        router.push('/dashboard');
      }
    });

    // 3. 혹시 이미 처리가 끝났을 경우를 대비한 수동 체크
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
      <h2 className="text-xl font-black text-gray-800 tracking-tight">보안 인증 처리 중...</h2>
      <p className="text-gray-500 mt-2 font-medium">잠시만 기다려주세요. 곧 대시보드로 이동합니다.</p>
    </div>
  );
}