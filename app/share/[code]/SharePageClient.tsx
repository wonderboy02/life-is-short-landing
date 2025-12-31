'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import PhotoUploadClient from './PhotoUploadClient';
import PhotoGridClient from './PhotoGridClient';
import ShareLanding from '@/components/share/ShareLanding';
import ServiceIntro from '@/components/share/ServiceIntroModal';
import FirstVisitGuideModal from '@/components/share/FirstVisitGuideModal';
import DevTools from '@/components/dev/DevTools';
import FixedBottomBar from '@/components/FixedBottomBar';
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
  createdAt: string;
  initialVideoStatus: 'pending' | 'requested' | 'processing' | 'completed' | 'failed' | null;
}

export default function SharePageClient({
  groupId,
  comment,
  creatorNickname,
  token,
  initialPhotos,
  shareUrl,
  shareCode,
  createdAt,
  initialVideoStatus,
}: SharePageClientProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showFirstVisitModal, setShowFirstVisitModal] = useState(false);
  const [shouldScrollAfterModalClose, setShouldScrollAfterModalClose] = useState(false);
  const [shareLandingMounted, setShareLandingMounted] = useState(false);
  const { photos, isLoading, refetch } = usePhotos(groupId, initialPhotos);
  const triggerFileSelectRef = useRef<(() => void) | null>(null);

  // 영상 제작 상태
  const [videoStatus, setVideoStatus] = useState<'pending' | 'requested' | 'processing' | 'completed' | 'failed' | null>(initialVideoStatus);

  // 개발 도구용 테스트 상태
  const [testMode, setTestMode] = useState(false);
  const [testPhotoCount, setTestPhotoCount] = useState<number>(0);
  const [testTimeOffset, setTestTimeOffset] = useState<number>(0); // 시간 오프셋 (시간 단위)

  // Refs for smooth scrolling
  const shareLandingNodeRef = useRef<HTMLDivElement | null>(null);
  const photoGridRef = useRef<HTMLDivElement>(null);

  // 공통 스크롤 함수 - ShareLanding의 상단을 헤더 바로 아래에 위치시킴
  const scrollToShareLanding = useCallback(() => {
    if (!shareLandingNodeRef.current) return;

    const headerHeight = 64; // h-16 = 64px
    const elementTop = shareLandingNodeRef.current.getBoundingClientRect().top;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetPosition = scrollTop + elementTop - headerHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }, []);

  // ref callback - ref 저장 및 마운트 상태 업데이트
  const shareLandingRef = useCallback((node: HTMLDivElement | null) => {
    shareLandingNodeRef.current = node;
    if (node) {
      setShareLandingMounted(true);
    }
  }, []);

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

  // 첫 방문 모달이 닫힐 때 스크롤 준비
  useEffect(() => {
    if (!showFirstVisitModal && shouldScrollAfterModalClose) {
      const visitKey = `service-intro-visited-${groupId}`;
      localStorage.setItem(visitKey, 'true');

      // 모달 닫기 애니메이션 완료 후 스크롤
      setTimeout(() => {
        scrollToShareLanding();
      }, 400);

      setShouldScrollAfterModalClose(false);
    }
  }, [showFirstVisitModal, shouldScrollAfterModalClose, groupId, scrollToShareLanding]);

  // 모달 열림 추적
  useEffect(() => {
    if (showFirstVisitModal) {
      setShouldScrollAfterModalClose(true);
    }
  }, [showFirstVisitModal]);

  // 재방문자 자동 스크롤 - 로딩 완료 후 실행
  useEffect(() => {
    // 로딩 완료 && 모달 표시 안 함 && ShareLanding 마운트됨
    if (!isLoading && !showFirstVisitModal && shareLandingMounted) {
      const visitKey = `service-intro-visited-${groupId}`;
      const hasVisited = localStorage.getItem(visitKey);

      if (hasVisited) {
        // DOM 렌더링 완료 보장
        requestAnimationFrame(() => {
          setTimeout(() => {
            scrollToShareLanding();
          }, 100);
        });
      }
    }
  }, [isLoading, showFirstVisitModal, shareLandingMounted, groupId, scrollToShareLanding]);

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

  const scrollToMain = useCallback(() => {
    // localStorage에 방문 기록 저장
    const visitKey = `service-intro-visited-${groupId}`;
    localStorage.setItem(visitKey, 'true');

    // 공통 함수 사용
    scrollToShareLanding();
  }, [groupId, scrollToShareLanding]);

  const scrollToPhotos = () => {
    photoGridRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddPhotos = () => {
    // 파일 선택 다이얼로그 열기
    if (triggerFileSelectRef.current) {
      triggerFileSelectRef.current();
    }
  };

  // 영상 제작 요청 핸들러
  const handleRequestVideo = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setVideoStatus('requested');
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('영상 제작 요청 오류:', error);
      return { success: false, error: '서버 오류가 발생했습니다.' };
    }
  };

  const handleGenerateVideo = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/video`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        alert('영상 제작이 신청되었습니다. 관리자가 확인 후 제작을 진행합니다.');
      } else {
        alert(result.error || '영상 제작 신청에 실패했습니다.');
      }
    } catch (error) {
      console.error('영상 제작 신청 오류:', error);
      alert('서버 오류가 발생했습니다.');
    }
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
      <DevTools
        onShowFirstVisitModal={() => setShowFirstVisitModal(true)}
        testMode={testMode}
        onTestModeChange={setTestMode}
        onTestPhotoCountChange={setTestPhotoCount}
        onTestTimeOffsetChange={setTestTimeOffset}
      />

      {/* 서비스 소개 섹션 */}
      <ServiceIntro onScrollToMain={scrollToMain} creatorNickname={creatorNickname} comment={comment} />

      {/* 랜딩 섹션 */}
      <div ref={shareLandingRef}>
        <ShareLanding
          creatorNickname={creatorNickname}
          comment={comment}
          photoCount={testMode ? testPhotoCount : photos.length}
          recentPhotos={photos.slice(0, 6)}
          onViewPhotos={scrollToPhotos}
          onRequestVideo={handleRequestVideo}
          videoStatus={videoStatus}
          createdAt={
            testMode
              ? new Date(
                  new Date(createdAt).getTime() + testTimeOffset * 60 * 60 * 1000
                ).toISOString()
              : createdAt
          }
        />
      </div>

      {/* 사진 업로드 섹션 - Grid보다 먼저 배치 */}
      <section className="bg-white py-12 scroll-mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <PhotoUploadClient
              groupId={groupId}
              token={token}
              onUploadSuccess={handleUploadSuccess}
              onPhotoUploaded={handlePhotoUploaded}
              onReady={(trigger) => {
                triggerFileSelectRef.current = trigger;
              }}
            />
          </div>
        </div>
      </section>

      {/* 사진 그리드 섹션 */}
      <section
        ref={photoGridRef}
        className="bg-neutral-50 py-12 pb-28 scroll-mt-16"
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

      {/* Fixed Bottom Bar */}
      <FixedBottomBar
        timerText="00:05:30"
        buttonText="사진 추가하기"
        onButtonClick={handleAddPhotos}
        showTimer={false}
      />
    </>
  );
}
