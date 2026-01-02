'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import PhotoUpload from '@/components/share/PhotoUpload';
import PhotoGridClient from './PhotoGridClient';
import ShareLanding from '@/components/share/ShareLanding';
import ServiceIntro from '@/components/share/ServiceIntroModal';
import FirstVisitGuideModal from '@/components/share/FirstVisitGuideModal';
import DevTools from '@/components/dev/DevTools';
import FixedBottomBar from '@/components/FixedBottomBar';
import { usePhotos } from '@/hooks/use-photos';
import { useTimer } from '@/hooks/use-timer';
import { useScrollToSection } from '@/hooks/use-scroll-to-section';
import { useVideoStatus } from '@/hooks/use-video-status';
import { useFirstVisit } from '@/hooks/use-first-visit';
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

const MIN_PHOTOS = 10;
const DEADLINE_HOURS = 72; // 3일

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
  // 사진 관리
  const [refreshKey, setRefreshKey] = useState(0);
  const { photos, isLoading, refetch } = usePhotos(groupId, initialPhotos);
  const triggerFileSelectRef = useRef<(() => void) | null>(null);
  const photoGridRef = useRef<HTMLDivElement>(null);

  // FixedBottomBar 높이 관리
  const [bottomBarHeight, setBottomBarHeight] = useState(0);

  // 테스트 모드 상태 (개발 도구용)
  const [testMode, setTestMode] = useState(false);
  const [testPhotoCount, setTestPhotoCount] = useState<number>(0);
  const [testTimeOffset, setTestTimeOffset] = useState<number>(0);
  const [testVideoStatus, setTestVideoStatus] = useState<
    'pending' | 'requested' | 'processing' | 'completed' | 'failed' | null
  >(null);

  // 커스텀 훅 사용
  const { timeLeft, hasTimeLeft } = useTimer({
    createdAt,
    deadlineHours: DEADLINE_HOURS,
    testMode,
    testTimeOffset,
  });

  const { sectionRef: shareLandingRef, scrollToSection: scrollToShareLanding } =
    useScrollToSection();

  const { videoStatus, setVideoStatus, requestVideo } = useVideoStatus({
    initialStatus: initialVideoStatus,
    groupId,
    token,
  });

  const { showFirstVisitModal, setShowFirstVisitModal, hasVisited, markAsVisited } =
    useFirstVisit({
      groupId,
      shareCode,
      isLoading,
    });

  // 테스트 모드 토글 시 초기화
  const handleTestModeChange = (enabled: boolean) => {
    if (enabled) {
      setTestPhotoCount(photos.length);
      setTestVideoStatus(videoStatus);
      setTestTimeOffset(48); // 기본값: 48시간 남음
    }
    setTestMode(enabled);
  };

  // 자동 스크롤 처리 (첫 방문 모달 닫힌 후 or 재방문자)
  useEffect(() => {
    // 로딩 완료 && 첫 방문 모달이 닫힌 상태
    if (!isLoading && !showFirstVisitModal && shareLandingRef.current) {
      if (hasVisited()) {
        // 재방문자: 즉시 스크롤
        requestAnimationFrame(() => {
          setTimeout(() => {
            scrollToShareLanding();
          }, 100);
        });
      }
    }
  }, [isLoading, showFirstVisitModal, hasVisited, scrollToShareLanding, shareLandingRef]);

  // 사진 업로드 성공 핸들러
  const handleUploadSuccess = () => {
    refetch();
    setRefreshKey((prev) => prev + 1);
  };

  const handlePhotoUploaded = async () => {
    await refetch();
    setRefreshKey((prev) => prev + 1);
    requestAnimationFrame(() => {
      photoGridRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  // 스크롤 핸들러
  const scrollToMain = useCallback(() => {
    markAsVisited();
    scrollToShareLanding();
  }, [markAsVisited, scrollToShareLanding]);

  const scrollToPhotos = () => {
    photoGridRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddPhotos = () => {
    if (triggerFileSelectRef.current) {
      triggerFileSelectRef.current();
    }
  };

  // Secondary 버튼 상태 계산
  const currentPhotoCount = testMode ? testPhotoCount : photos.length;
  const currentVideoStatus = testMode ? testVideoStatus : videoStatus;
  const photosNeeded = Math.max(0, MIN_PHOTOS - currentPhotoCount);
  const canGenerateVideo =
    currentPhotoCount >= MIN_PHOTOS &&
    hasTimeLeft &&
    (currentVideoStatus === 'pending' || currentVideoStatus === null);

  const getSecondaryButtonConfig = () => {
    if (!hasTimeLeft) {
      return { text: '마감되었습니다', disabled: true };
    }

    if (currentVideoStatus === 'completed') {
      return { text: '영상 완성', disabled: true };
    }
    if (currentVideoStatus === 'processing' || currentVideoStatus === 'requested') {
      return { text: '영상 제작 중', disabled: true };
    }

    if (currentPhotoCount < MIN_PHOTOS) {
      return { text: `${photosNeeded}장 더 필요해요`, disabled: true };
    }

    return { text: '영상 만들기', disabled: false };
  };

  const secondaryButtonConfig = getSecondaryButtonConfig();

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
        onOpenChange={(open) => {
          setShowFirstVisitModal(open);
          // 모달 닫힐 때 방문 기록 저장 및 스크롤
          if (!open) {
            markAsVisited();
            setTimeout(() => {
              scrollToShareLanding();
            }, 400);
          }
        }}
        shareUrl={shareUrl}
      />

      {/* 개발 도구 (개발 환경 전용) */}
      <DevTools
        onShowFirstVisitModal={() => setShowFirstVisitModal(true)}
        testMode={testMode}
        onTestModeChange={handleTestModeChange}
        onTestPhotoCountChange={setTestPhotoCount}
        onTestTimeOffsetChange={setTestTimeOffset}
        onTestVideoStatusChange={setTestVideoStatus}
        currentPhotoCount={currentPhotoCount}
        currentVideoStatus={currentVideoStatus}
        hasTimeLeft={hasTimeLeft}
        timeLeft={timeLeft}
        secondaryButtonText={secondaryButtonConfig.text}
        secondaryButtonDisabled={secondaryButtonConfig.disabled}
      />

      {/* 서비스 소개 섹션 */}
      <ServiceIntro
        onScrollToMain={scrollToMain}
        creatorNickname={creatorNickname}
        comment={comment}
        shareUrl={shareUrl}
      />

      {/* 랜딩 섹션 */}
      <div ref={shareLandingRef}>
        <ShareLanding
          creatorNickname={creatorNickname}
          comment={comment}
          photoCount={currentPhotoCount}
          recentPhotos={photos.slice(0, 6)}
          onViewPhotos={scrollToPhotos}
        />
      </div>

      {/* 사진 업로드 섹션 */}
      <section className="bg-white py-10 scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <PhotoUpload
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
        className="bg-neutral-50 py-10 scroll-mt-16"
        style={{ paddingBottom: `${bottomBarHeight + 32}px` }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-semibold mb-6 font-display">모인 추억들</h2>
            <PhotoGridClient key={refreshKey} groupId={groupId} />
          </div>
        </div>
      </section>

      {/* Fixed Bottom Bar */}
      <FixedBottomBar
        primaryButton={{
          text: '사진 추가하기',
          onClick: handleAddPhotos,
        }}
        secondaryButton={{
          text: secondaryButtonConfig.text,
          onClick: requestVideo,
          disabled: secondaryButtonConfig.disabled,
        }}
        onHeightChange={setBottomBarHeight}
      />
    </>
  );
}
