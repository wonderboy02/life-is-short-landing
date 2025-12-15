'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Trash2, User } from 'lucide-react';
import type { PhotoWithUrl } from '@/lib/supabase/types';
import DeletePhotoDialog from './DeletePhotoDialog';

interface PhotoGridProps {
  photos: PhotoWithUrl[];
  groupId: string;
  onDeleteSuccess?: () => void;
}

export default function PhotoGrid({
  photos,
  groupId,
  onDeleteSuccess,
}: PhotoGridProps) {
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

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

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative aspect-square rounded-xl overflow-hidden bg-neutral-100 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* 사진 */}
            <Image
              src={photo.url}
              alt={photo.file_name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 33vw"
            />

            {/* 호버 오버레이 */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200" />

            {/* 삭제 버튼 */}
            <button
              onClick={() => setSelectedPhotoId(photo.id)}
              className="absolute top-2 right-2 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
              title="사진 삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* 업로더 닉네임 + 설명 */}
            <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-y-1">
              <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                <User className="w-3 h-3" />
                <span>{photo.uploader_nickname}</span>
              </div>
              {photo.description && (
                <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-md line-clamp-2">
                  {photo.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

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
    </>
  );
}
