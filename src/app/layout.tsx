import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🚀 [마케팅용 Open Graph 세팅]
export const metadata: Metadata = {
  title: 'MONEYGUARD | 1분 만에 찾는 내 기업 정부지원금',
  description: '놓친 정부지원금, 데이터 시스템으로 무료 진단하고 완벽한 사업계획서 초안까지 즉시 받아보세요.',
  keywords: ['정부지원금', '정책자금', '사업계획서', '중소기업', '스타트업', '지원금매칭', 'YM Studio'],
  openGraph: {
    title: 'MONEYGUARD | 정부지원금 1분 정밀 진단',
    description: '올해 놓치신 정부지원금이 얼마인지 아시나요? 상위 1% 전문가 시스템이 우리 회사에 딱 맞는 공고를 찾아드립니다.',
    url: 'https://mg.ymstudio.co.kr',
    siteName: 'MONEYGUARD',
    images: [
      {
        url: '/banner.png', // 아까 public에 넣으신 배너 이미지를 카톡 썸네일로 씁니다!
        width: 1200,
        height: 630,
        alt: 'MONEYGUARD 서비스 썸네일',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}