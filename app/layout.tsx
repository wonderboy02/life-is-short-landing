import type React from 'react';
import type { Metadata } from 'next';
import { ToasterProvider } from '@/components/providers/toaster-provider';
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-gray-100">
        <div className="max-w-[428px] mx-auto bg-white min-h-screen shadow-xl">
          <GlobalLoader />
          {children}
          <ToasterProvider />
        </div>
      </body>
    </html>
  );
}
