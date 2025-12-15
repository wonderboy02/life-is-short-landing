'use client';

import { Button } from '@/components/ui/button';
import { Image as ImageIcon } from 'lucide-react';
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
    <section className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-white to-neutral-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto space-y-8">
          {/* 환영 메시지 */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold font-display leading-tight">
              {creatorNickname}이 영상을 위한
              <br />
              사진을 모으고 있어요
            </h1>
            <p className="text-lg text-neutral-600">{groupName}</p>
          </div>

          {/* 사진 개수 통계 카드 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-7 h-7 text-neutral-700" />
              </div>
              <div className="text-center">
                <p className="text-sm text-neutral-600 mb-1">현재</p>
                <p className="text-3xl font-bold text-neutral-900">
                  {photoCount}개의 사진
                </p>
                <p className="text-sm text-neutral-600 mt-1">이 모였어요</p>
              </div>
            </div>
          </div>

          {/* 최근 사진 미리보기 */}
          {recentPhotos.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center font-display">
                최근 추가된 사진
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {recentPhotos.slice(0, 6).map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-lg overflow-hidden bg-neutral-100 shadow-sm"
                  >
                    <img
                      src={photo.url}
                      alt={photo.file_name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA 버튼 */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={onViewPhotos}
              size="lg"
              className="w-full bg-neutral-900 hover:bg-neutral-800 h-14 text-base"
            >
              사진 보기 ({photoCount})
            </Button>
            <Button
              onClick={onAddPhotos}
              size="lg"
              variant="outline"
              className="w-full border-neutral-300 hover:bg-neutral-50 h-14 text-base"
            >
              사진 추가하기
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
