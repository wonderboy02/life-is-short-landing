'use client';

import { useState, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import PhotoUploadClient from './PhotoUploadClient';
import PhotoGridClient from './PhotoGridClient';
import ShareLanding from '@/components/share/ShareLanding';
import ServiceIntro from '@/components/share/ServiceIntroModal';
import DevTools from '@/components/dev/DevTools';
import { usePhotos } from '@/hooks/use-photos';

interface SharePageClientProps {
  groupId: string;
  groupName: string;
  creatorNickname: string;
  token: string;
}

export default function SharePageClient({
  groupId,
  groupName,
  creatorNickname,
  token,
}: SharePageClientProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { photos, isLoading } = usePhotos(groupId);

  // Refs for smooth scrolling
  const shareLandingNodeRef = useRef<HTMLDivElement | null>(null);
  const photoGridRef = useRef<HTMLDivElement>(null);
  const photoUploadRef = useRef<HTMLDivElement>(null);

  // 재방문자 자동 스크롤 - ref callback 패턴
  const shareLandingRef = useCallback(
    (node: HTMLDivElement | null) => {
      shareLandingNodeRef.current = node;

      if (node && !isLoading) {
        const visitKey = `service-intro-visited-${groupId}`;
        const hasVisited = localStorage.getItem(visitKey);

        if (hasVisited) {
          // requestAnimationFrame으로 다음 렌더링 사이클에 스크롤
          requestAnimationFrame(() => {
            node.scrollIntoView({ behavior: 'smooth' });
          });
        }
      }
    },
    [groupId, isLoading]
  );

  const handleUploadSuccess = () => {
    // 업로드 성공 시 PhotoGrid 강제 새로고침
    setRefreshKey((prev) => prev + 1);
  };

  const scrollToMain = () => {
    // localStorage에 방문 기록 저장
    const visitKey = `service-intro-visited-${groupId}`;
    localStorage.setItem(visitKey, 'true');

    shareLandingNodeRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPhotos = () => {
    photoGridRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToUpload = () => {
    photoUploadRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <>
      {/* 개발 도구 (개발 환경 전용) */}
      <DevTools />

      {/* 서비스 소개 섹션 */}
      <ServiceIntro onScrollToMain={scrollToMain} />

      {/* 랜딩 섹션 */}
      <div ref={shareLandingRef}>
        <ShareLanding
          creatorNickname={creatorNickname}
          groupName={groupName}
          photoCount={photos.length}
          recentPhotos={photos.slice(0, 6)}
          onViewPhotos={scrollToPhotos}
          onAddPhotos={scrollToUpload}
        />
      </div>

      {/* 사진 그리드 섹션 */}
      <section
        ref={photoGridRef}
        className="min-h-screen bg-neutral-50 py-12 scroll-mt-16"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 font-display">
              모인 추억들
            </h2>
            <PhotoGridClient key={refreshKey} groupId={groupId} />
          </div>
        </div>
      </section>

      {/* 사진 업로드 섹션 */}
      <section
        ref={photoUploadRef}
        className="min-h-screen bg-white py-12 scroll-mt-16"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <PhotoUploadClient
              groupId={groupId}
              token={token}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>
        </div>
      </section>
    </>
  );
}
