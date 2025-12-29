'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 로그인 페이지인지 확인
  const isLoginPage = pathname === '/admin';

  useEffect(() => {
    if (isLoginPage) {
      // 로그인 페이지는 인증 체크 안 함
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [router, isLoginPage]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  };

  // 로그인 페이지는 레이아웃 없이 그대로 렌더링
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-neutral-500">로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-900">
                관리자 대시보드
              </h1>
              {/* 네비게이션 */}
              <nav className="flex gap-2">
                <Button
                  variant={pathname === '/admin/dashboard' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => router.push('/admin/dashboard')}
                >
                  대시보드
                </Button>
                <Button
                  variant={pathname === '/admin/queue' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => router.push('/admin/queue')}
                >
                  전체 큐
                </Button>
              </nav>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="px-6 py-8">
        {children}
      </main>
    </div>
  );
}
