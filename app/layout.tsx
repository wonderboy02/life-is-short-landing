import type React from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { ToasterProvider } from '@/components/providers/toaster-provider';
import { KakaoProvider } from '@/components/providers/kakao-provider';
import GlobalLoader from '@/components/GlobalLoader';
import './globals.css';

export const metadata: Metadata = {
  title: '추억을 다시, 영상으로 | AI 사진 영상 변환',
  description: 'AI가 오래된 사진에 생명을 불어넣습니다',
  icons: {
    icon: '/favicon/icon.png',
    apple: '/favicon/apple-icon.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <html lang="ko">
      <body className="antialiased bg-gray-100">
        <KakaoProvider />
        {isAdminPage ? (
          // Admin 페이지: 전체 width 사용
          <>
            <GlobalLoader />
            {children}
            <ToasterProvider />
          </>
        ) : (
          // 일반 페이지: 모바일 전용 (428px 제한)
          <div className="max-w-[428px] mx-auto bg-white min-h-screen shadow-xl">
            <GlobalLoader />
            {children}
            <ToasterProvider />
          </div>
        )}
      </body>
    </html>
  );
}
