import { useState, useEffect, useCallback } from 'react';
import type { PhotoWithUrl, PhotoListResponse } from '@/lib/supabase/types';

export function usePhotos(groupId: string) {
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    if (!groupId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/photos?groupId=${groupId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '사진 목록을 불러올 수 없습니다.');
      }

      const data: PhotoListResponse = result.data;
      setPhotos(data.photos);
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류';
      setError(message);
      console.error('사진 목록 조회 오류:', err);
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  return {
    photos,
    isLoading,
    error,
    refetch: fetchPhotos,
  };
}
