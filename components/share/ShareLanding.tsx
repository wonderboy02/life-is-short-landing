'use client';

import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import type { PhotoWithUrl } from '@/lib/supabase/types';

interface ShareLandingProps {
  creatorNickname: string;
  groupName: string;
  photoCount: number;
  recentPhotos: PhotoWithUrl[];
  onViewPhotos: () => void;
  onAddPhotos: () => void;
}

export default function ShareLanding({
  creatorNickname,
  groupName,
  photoCount,
  recentPhotos,
  onViewPhotos,
  onAddPhotos,
}: ShareLandingProps) {
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
              <p className="text-lg font-medium text-neutral-800">{groupName}</p>
              <p className="mt-2 text-sm text-neutral-500">
                영상으로 남길 <span className="font-semibold text-neutral-700">{photoCount}개</span>
                의 순간
              </p>
            </div>
          </div>

          {/* 최근 사진 미리보기 */}
          {recentPhotos.length > 0 && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {recentPhotos.slice(0, 6).map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square overflow-hidden rounded-xl bg-neutral-100"
                  >
                    <img
                      src={photo.url}
                      alt={photo.file_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-neutral-400">함께 모은 소중한 순간들</p>
            </div>
          )}

          {/* CTA 버튼 */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={onAddPhotos}
              size="lg"
              className="h-14 w-full rounded-xl bg-neutral-900 text-base font-semibold shadow-sm hover:bg-neutral-800"
            >
              옛 사진 추가하기
            </Button>
            {photoCount > 0 && (
              <Button
                onClick={onViewPhotos}
                size="lg"
                variant="outline"
                className="h-14 w-full rounded-xl border-neutral-300 text-base font-medium hover:bg-neutral-50"
              >
                모든 사진 보기 ({photoCount})
              </Button>
            )}
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
    </section>
  );
}
