'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import PhotoUploadClient from './PhotoUploadClient';
import PhotoGridClient from './PhotoGridClient';
import ShareLanding from '@/components/share/ShareLanding';
import ServiceIntro from '@/components/share/ServiceIntroModal';
import FirstVisitGuideModal from '@/components/share/FirstVisitGuideModal';
import DevTools from '@/components/dev/DevTools';
import { usePhotos } from '@/hooks/use-photos';
import type { PhotoWithUrl } from '@/lib/supabase/types';

interface SharePageClientProps {
  groupId: string;
  comment: string;
  creatorNickname: string;
  token: string;
  initialPhotos: PhotoWithUrl[];
  shareUrl: string;
  shareCode: string;
}

export default function SharePageClient({
  groupId,
  comment,
  creatorNickname,
  token,
  initialPhotos,
  shareUrl,
  shareCode,
}: SharePageClientProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showFirstVisitModal, setShowFirstVisitModal] = useState(false);
  const { photos, isLoading, refetch } = usePhotos(groupId, initialPhotos);

  // Refs for smooth scrolling
  const shareLandingNodeRef = useRef<HTMLDivElement | null>(null);
  const photoGridRef = useRef<HTMLDivElement>(null);
  const photoUploadRef = useRef<HTMLDivElement>(null);

  // 앨범 생성 직후 확인 및 모달 표시
  useEffect(() => {
    if (!isLoading) {
      const justCreatedCode = localStorage.getItem('album-just-created');

      // 앨범을 방금 생성했고, 현재 페이지가 그 앨범이면 모달 표시
      if (justCreatedCode === shareCode) {
        setShowFirstVisitModal(true);
        // 플래그 제거 (한 번만 표시)
        localStorage.removeItem('album-just-created');
      }
    }
  }, [shareCode, isLoading]);

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
    // 전체 업로드 완료 시 사진 목록 최종 새로고침
    refetch();
    setRefreshKey((prev) => prev + 1);
  };

  const handlePhotoUploaded = async () => {
    // 첫 번째 사진 업로드 완료 시: refetch 후 스크롤
    await refetch();
    setRefreshKey((prev) => prev + 1);

    // refetch 완료 후 스크롤 (다음 프레임에서 실행)
    requestAnimationFrame(() => {
      photoGridRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
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
      {/* 첫 방문 안내 모달 */}
      <FirstVisitGuideModal
        open={showFirstVisitModal}
        onOpenChange={setShowFirstVisitModal}
        shareUrl={shareUrl}
      />

      {/* 개발 도구 (개발 환경 전용) */}
      <DevTools onShowFirstVisitModal={() => setShowFirstVisitModal(true)} />

      {/* 서비스 소개 섹션 */}
      <ServiceIntro onScrollToMain={scrollToMain} creatorNickname={creatorNickname} comment={comment} />

      {/* 랜딩 섹션 */}
      <div ref={shareLandingRef} className="scroll-mt-16">
        <ShareLanding
          creatorNickname={creatorNickname}
          comment={comment}
          photoCount={photos.length}
          recentPhotos={photos.slice(0, 6)}
          onViewPhotos={scrollToPhotos}
          onAddPhotos={scrollToUpload}
        />
      </div>

      {/* 사진 업로드 섹션 - Grid보다 먼저 배치 */}
      <section
        ref={photoUploadRef}
        className="bg-white py-12 scroll-mt-16"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <PhotoUploadClient
              groupId={groupId}
              token={token}
              onUploadSuccess={handleUploadSuccess}
              onPhotoUploaded={handlePhotoUploaded}
            />
          </div>
        </div>
      </section>

      {/* 사진 그리드 섹션 */}
      <section
        ref={photoGridRef}
        className="bg-neutral-50 py-12 scroll-mt-16"
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
    </>
  );
}
