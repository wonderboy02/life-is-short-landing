'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Clock, Image } from 'lucide-react';
import type { PhotoWithUrl } from '@/lib/supabase/types';
import ImageViewerModal from './ImageViewerModal';

interface ShareLandingProps {
  creatorNickname: string;
  comment: string;
  photoCount: number;
  recentPhotos: PhotoWithUrl[];
  onViewPhotos: () => void;
  onAddPhotos: () => void;
  onRequestVideo: () => Promise<{ success: boolean; error?: string }>;
  videoStatus: 'pending' | 'requested' | 'processing' | 'completed' | 'failed' | null;
  createdAt: string;
}

export default function ShareLanding({
  creatorNickname,
  comment,
  photoCount,
  recentPhotos,
  onViewPhotos,
  onAddPhotos,
  onRequestVideo,
  videoStatus,
  createdAt,
}: ShareLandingProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const MIN_PHOTOS = 10;
  const DEADLINE_HOURS = 72; // 3일

  // 타이머 계산
  useEffect(() => {
    const calculateTimeLeft = () => {
      const created = new Date(createdAt).getTime();
      const deadline = created + DEADLINE_HOURS * 60 * 60 * 1000;
      const now = Date.now();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ days, hours, minutes });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, [createdAt]);

  const photosNeeded = Math.max(0, MIN_PHOTOS - photoCount);
  const canGenerateVideo = photoCount >= MIN_PHOTOS;

  // 영상 제작 요청 핸들러
  const handleVideoRequest = async () => {
    setIsRequesting(true);
    const result = await onRequestVideo();
    setIsRequesting(false);

    if (!result.success && result.error) {
      // 에러는 부모 컴포넌트에서 처리하거나 여기서 toast로 표시 가능
      console.error(result.error);
    }
  };

  return (
    <section className="flex min-h-[100dvh] flex-col justify-between bg-white px-4 py-12">
      <div className="flex flex-1 items-center justify-center">
        <div className="mx-auto w-full max-w-lg space-y-10">
          {/* 메인 메시지 */}
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="font-display text-4xl leading-tight font-bold text-neutral-900">
                {creatorNickname}님과 모으는
              </h1>
              <p className="text-2xl leading-relaxed text-neutral-600">
                부모님의 청춘,
                <br />
                우리의 이야기
              </p>
            </div>

            <div className="py-4">
              <p className="text-lg font-medium text-neutral-800">{comment}</p>
              <p className="mt-2 text-sm text-neutral-500">
                영상으로 남길 <span className="font-semibold text-neutral-700">{photoCount}개</span>
                의 순간
              </p>
            </div>
          </div>

          {/* 상태 메시지 */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
            <div className="space-y-4 text-center">
              {/* 상태 1: 시간 O + 사진 부족 (1~9장) */}
              {timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 ? (
                photoCount > 0 && !canGenerateVideo ? (
                  <>
                    <div className="space-y-2">
                      <h3 className="font-display text-xl font-semibold text-neutral-900">
                        {photosNeeded}장만 더 모으면 완성할 수 있어요!
                      </h3>
                      <p className="text-sm leading-relaxed text-neutral-600">
                        더 많은 사진이 모일수록, 부모님의 청춘이 더 생생하게 되살아나요
                      </p>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-neutral-500">
                        {timeLeft.days > 0 && `${timeLeft.days}일 `}
                        {timeLeft.hours > 0 && `${timeLeft.hours}시간 `}
                        {timeLeft.minutes > 0 && `${timeLeft.minutes}분 `}
                        남음
                      </p>
                    </div>
                  </>
                ) : /* 상태 2: 시간 O + 사진 0장 */
                photoCount === 0 ? (
                  <>
                    <div className="space-y-2">
                      <h3 className="font-display text-xl font-semibold text-neutral-900">
                        가족들과 추억을 모아보세요
                      </h3>
                      <p className="text-sm leading-relaxed text-neutral-600">
                        링크를 공유하고 첫 번째 사진을 기다려요
                      </p>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-neutral-500">
                        {timeLeft.days > 0 && `${timeLeft.days}일 `}
                        {timeLeft.hours > 0 && `${timeLeft.hours}시간 `}
                        남음
                      </p>
                    </div>
                  </>
                ) : (
                  /* 상태 3: 시간 O + 사진 충분 */
                  <>
                    <div className="space-y-2">
                      <h3 className="font-display text-xl font-semibold text-neutral-900">
                        {videoStatus === 'requested'
                          ? '영상 제작 신청이 완료되었어요'
                          : videoStatus === 'processing'
                            ? '영상 제작이 진행 중이에요'
                            : videoStatus === 'completed'
                              ? '영상이 완성되었어요'
                              : `${photoCount}장의 추억이 모였어요`}
                      </h3>
                      <p className="text-sm leading-relaxed text-neutral-600">
                        {videoStatus === 'requested'
                          ? '제공해주신 연락처로 곧 연락드릴게요'
                          : videoStatus === 'processing'
                            ? '완성되면 제공해주신 연락처로 연락드릴게요'
                            : videoStatus === 'completed'
                              ? '제공해주신 연락처로 영상을 전달해드렸어요'
                              : '이제 특별한 영상으로 만들어볼까요?'}
                      </p>
                    </div>
                    {/* 영상 제작 버튼 or 안내 문구 */}
                    {videoStatus === 'requested' ||
                    videoStatus === 'processing' ||
                    videoStatus === 'completed' ? (
                      <div className="pt-4">
                        <div className="rounded-lg bg-neutral-100 px-4 py-3">
                          <p className="text-center text-sm text-neutral-600">
                            {videoStatus === 'requested'
                              ? '영상 확인 후 제작 중입니다'
                              : videoStatus === 'processing'
                                ? 'AI가 추억을 영상으로 만들고 있어요'
                                : '앨범을 만들어주셔서 감사해요'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4">
                        <Button
                          size="lg"
                          onClick={handleVideoRequest}
                          disabled={isRequesting}
                          className="h-12 rounded-xl bg-neutral-900 font-semibold hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isRequesting ? '요청 중...' : '영상 만들기'}
                        </Button>
                      </div>
                    )}
                  </>
                )
              ) : /* 시간 마감 */
              canGenerateVideo ? (
                /* 상태 4: 시간 X + 사진 충분 */
                <>
                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-semibold text-neutral-900">
                      추억을 모두 담았어요
                    </h3>
                    <p className="text-sm leading-relaxed text-neutral-600">
                      또 다른 이야기를 담고 싶다면, 새 앨범을 만들어보세요
                    </p>
                  </div>
                  <div className="pt-4">
                    <Button
                      size="lg"
                      className="h-12 rounded-xl bg-neutral-900 font-semibold hover:bg-neutral-800"
                      onClick={() => (window.location.href = '/')}
                    >
                      새 앨범 만들기
                    </Button>
                  </div>
                </>
              ) : (
                /* 상태 5: 시간 X + 사진 부족 */
                <>
                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-semibold text-neutral-900">
                      시간이 부족했나요?
                    </h3>
                    <p className="text-sm leading-relaxed text-neutral-600">
                      괜찮아요, 하루 더 함께해요
                    </p>
                  </div>
                  <div className="pt-4">
                    <Button
                      size="lg"
                      className="h-12 rounded-xl bg-neutral-900 font-semibold hover:bg-neutral-800"
                      onClick={() => {
                        // TODO: 🚨🚨🚨 중요! 반드시 구현 필요! 🚨🚨🚨
                        // 이 버튼은 앨범의 마감 시간을 24시간 연장하는 기능을 구현해야 합니다.
                        // 현재는 임시로 새 앨범 만들기 페이지로 리다이렉트합니다.
                        //
                        // 구현 필요 사항:
                        // 1. API 엔드포인트 생성: PUT /api/groups/[groupId]/extend
                        // 2. groups 테이블에 deadline 컬럼 추가 필요 (현재는 created_at + 72시간으로 계산)
                        // 3. 연장 횟수 제한 (1회만? 무제한?)
                        // 4. 연장 성공 시 사용자에게 피드백 제공
                        //
                        // 임시 동작: 새 앨범 만들기 페이지로 이동
                        window.location.href = '/';
                      }}
                    >
                      하루 더 모으기
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 최근 사진 미리보기 */}
          {recentPhotos.length > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {recentPhotos.slice(0, 6).map((photo, index) => (
                  <div
                    key={photo.id}
                    className="aspect-square overflow-hidden rounded-lg bg-neutral-100 cursor-pointer transition-transform active:scale-95"
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.file_name}
                      className="h-full w-full object-cover pointer-events-none"
                    />
                  </div>
                ))}
              </div>
              {/* 사진 모두보기 텍스트 링크 */}
              <div className="flex justify-center">
                <button
                  onClick={onViewPhotos}
                  className="text-sm text-neutral-600 hover:text-neutral-900 underline underline-offset-2 transition-colors"
                >
                  사진 모두보기 ({photoCount})
                </button>
              </div>
            </div>
          )}

          {/* CTA 버튼 */}
          <div className="flex flex-col gap-3 pt-6">
            <Button
              onClick={onAddPhotos}
              size="lg"
              className="h-14 w-full rounded-xl bg-neutral-900 text-base font-semibold shadow-sm hover:bg-neutral-800"
            >
              내가 가진 사진 모으기
            </Button>
          </div>

          {/* 스크롤 힌트 */}
          <div className="flex justify-center pt-6">
            <button
              onClick={onAddPhotos}
              className="flex flex-col items-center gap-1 text-neutral-400 transition-colors hover:text-neutral-600"
              aria-label="아래로 스크롤"
            >
              <span className="text-xs">아래로</span>
              <ChevronDown className="h-5 w-5 animate-bounce" />
            </button>
          </div>
        </div>
      </div>

      {/* 이미지 뷰어 모달 */}
      {selectedImageIndex !== null && (
        <ImageViewerModal
          images={recentPhotos.slice(0, 6).map((photo) => ({
            url: photo.url,
            alt: photo.file_name,
          }))}
          initialIndex={selectedImageIndex}
          open={selectedImageIndex !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedImageIndex(null);
          }}
        />
      )}
    </section>
  );
}
