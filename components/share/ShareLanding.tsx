'use client';

import { useState } from 'react';
import type { PhotoWithUrl } from '@/lib/supabase/types';
import ImageViewerModal from './ImageViewerModal';

interface ShareLandingProps {
  creatorNickname: string;
  comment: string;
  photoCount: number;
  recentPhotos: PhotoWithUrl[];
  onViewPhotos: () => void;
}

export default function ShareLanding({
  creatorNickname,
  comment,
  photoCount,
  recentPhotos,
  onViewPhotos,
}: ShareLandingProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  return (
    <section className="flex min-h-[50dvh] flex-col justify-between bg-white px-4 py-10">
      <div className="flex flex-1 items-center justify-center">
        <div className="mx-auto w-full max-w-lg space-y-8">
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

          {/* 최근 사진 미리보기 */}
          {recentPhotos.length > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {recentPhotos.slice(0, 6).map((photo, index) => (
                  <div
                    key={photo.id}
                    className="aspect-square cursor-pointer overflow-hidden rounded-lg bg-neutral-100 transition-transform active:scale-95"
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.file_name}
                      className="pointer-events-none h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {/* 사진 모두보기 텍스트 링크 */}
              <div className="flex justify-center">
                <button
                  onClick={onViewPhotos}
                  className="text-sm text-neutral-600 underline underline-offset-2 transition-colors hover:text-neutral-900"
                >
                  사진 모두보기 ({photoCount})
                </button>
              </div>
            </div>
          )}
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
