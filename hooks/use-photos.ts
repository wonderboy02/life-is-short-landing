import { useState, useEffect, useCallback } from 'react';
import type { PhotoWithUrl, PhotoListResponse } from '@/lib/supabase/types';

export function usePhotos(groupId: string, initialPhotos?: PhotoWithUrl[]) {
  const [photos, setPhotos] = useState<PhotoWithUrl[]>(initialPhotos || []);
  const [isLoading, setIsLoading] = useState(!initialPhotos); // initialPhotos가 있으면 로딩 스킵
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = useCallback(async (isRefetch = false) => {
    if (!groupId) return;

    // 초기 로드일 때만 isLoading을 true로 설정
    if (!isRefetch) {
      setIsLoading(true);
    }
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
      if (!isRefetch) {
        setIsLoading(false);
      }
    }
  }, [groupId]);

  useEffect(() => {
    // initialPhotos가 있으면 초기 fetch 스킵
    if (!initialPhotos) {
      fetchPhotos(false);
    }
  }, [fetchPhotos, initialPhotos]);

  const refetch = useCallback(() => {
    return fetchPhotos(true);
  }, [fetchPhotos]);

  return {
    photos,
    isLoading,
    error,
    refetch,
  };
}
