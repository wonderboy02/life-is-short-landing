'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Trash2, User, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PhotoWithUrl } from '@/lib/supabase/types';
import DeletePhotoDialog from './DeletePhotoDialog';
import ImageViewerModal from './ImageViewerModal';

interface PhotoGridProps {
  photos: PhotoWithUrl[];
  groupId: string;
  onDeleteSuccess?: () => void;
}

const INITIAL_DISPLAY_COUNT = 10;

export default function PhotoGrid({
  photos,
  groupId,
  onDeleteSuccess,
}: PhotoGridProps) {
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="bg-neutral-50 rounded-2xl p-12 text-center border border-neutral-200">
        <p className="text-neutral-600">
          아직 업로드된 사진이 없습니다.
          <br />
          첫 번째 사진을 공유해보세요!
        </p>
      </div>
    );
  }

  const displayedPhotos = showAll
    ? photos
    : photos.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMore = photos.length > INITIAL_DISPLAY_COUNT;

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {displayedPhotos.map((photo, index) => (
          <div
            key={photo.id}
            className="group relative aspect-square rounded-xl overflow-hidden bg-neutral-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedImageIndex(index)}
          >
            {/* 사진 */}
            <Image
              src={photo.url}
              alt={photo.file_name}
              fill
              className="object-cover pointer-events-none"
              sizes="(max-width: 640px) 50vw, 33vw"
            />

            {/* 메뉴 버튼 (삭제) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhotoId(photo.id);
              }}
              className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors shadow-md backdrop-blur-sm"
              aria-label="메뉴"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* 업로더 닉네임 */}
            <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
              <div className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 w-fit backdrop-blur-sm">
                <User className="w-3 h-3" />
                <span>{photo.uploader_nickname}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 모두 보기 버튼 */}
      {hasMore && !showAll && (
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => setShowAll(true)}
            variant="outline"
            size="lg"
            className="px-8 h-12 text-base rounded-xl border-neutral-300 hover:bg-neutral-50"
          >
            모두 보기 ({photos.length - INITIAL_DISPLAY_COUNT}개 더)
          </Button>
        </div>
      )}

      {/* 삭제 다이얼로그 */}
      {selectedPhotoId && (
        <DeletePhotoDialog
          photoId={selectedPhotoId}
          groupId={groupId}
          open={!!selectedPhotoId}
          onOpenChange={(open) => {
            if (!open) setSelectedPhotoId(null);
          }}
          onDeleteSuccess={() => {
            setSelectedPhotoId(null);
            onDeleteSuccess?.();
          }}
        />
      )}

      {/* 이미지 뷰어 모달 */}
      {selectedImageIndex !== null && (
        <ImageViewerModal
          images={photos.map((photo) => ({
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
    </>
  );
}
