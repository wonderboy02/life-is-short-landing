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
    <section className="min-h-[100dvh] flex flex-col justify-between bg-white py-12 px-4">
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-lg mx-auto w-full space-y-10">
          {/* 메인 메시지 */}
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold font-display leading-tight text-neutral-900">
                {creatorNickname}님이 모으는
              </h1>
              <p className="text-2xl text-neutral-600 leading-relaxed">
                부모님의 청춘,
                <br />
                우리의 이야기
              </p>
            </div>

            <div className="py-4">
              <p className="text-lg font-medium text-neutral-800">{groupName}</p>
              <p className="text-sm text-neutral-500 mt-2">
                영상으로 남길 <span className="font-semibold text-neutral-700">{photoCount}개</span>의 순간
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
                    className="aspect-square rounded-xl overflow-hidden bg-neutral-100"
                  >
                    <img
                      src={photo.url}
                      alt={photo.file_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-center text-neutral-400">
                함께 모은 소중한 순간들
              </p>
            </div>
          )}

          {/* CTA 버튼 */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={onAddPhotos}
              size="lg"
              className="w-full bg-neutral-900 hover:bg-neutral-800 h-14 text-base font-semibold rounded-xl shadow-sm"
            >
              옛 사진 추가하기
            </Button>
            {photoCount > 0 && (
              <Button
                onClick={onViewPhotos}
                size="lg"
                variant="outline"
                className="w-full border-neutral-300 hover:bg-neutral-50 h-14 text-base font-medium rounded-xl"
              >
                모든 사진 보기 ({photoCount})
              </Button>
            )}
          </div>

          {/* 스크롤 힌트 */}
          <div className="flex justify-center pt-6">
            <button
              onClick={onAddPhotos}
              className="text-neutral-400 hover:text-neutral-600 transition-colors flex flex-col items-center gap-1"
              aria-label="아래로 스크롤"
            >
              <span className="text-xs">아래로</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
