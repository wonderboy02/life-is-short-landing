/**
 * Presigned URL에서 Storage path를 추출합니다.
 *
 * @param url - Presigned URL (예: https://xxx.supabase.co/storage/v1/object/sign/generated-videos/group-abc/video-123.mp4?token=xxx&exp=xxx)
 * @returns Storage path (예: "group-abc/video-123.mp4") 또는 null (추출 실패시)
 *
 * @example
 * extractStoragePathFromPresignedUrl('https://xxx.supabase.co/storage/v1/object/sign/generated-videos/group-123/video-456.mp4?token=abc&exp=123')
 * // Returns: "group-123/video-456.mp4"
 *
 * extractStoragePathFromPresignedUrl(null)
 * // Returns: null
 *
 * extractStoragePathFromPresignedUrl('invalid-url')
 * // Returns: null
 */
export function extractStoragePathFromPresignedUrl(
  url: string | null | undefined
): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    // URL에서 generated-videos/ 이후 부분 추출
    const parts = url.split('/generated-videos/');
    if (parts.length < 2) {
      return null;
    }

    // 쿼리 파라미터 이전 부분만 추출
    const storagePath = parts[1]?.split('?')[0];

    return storagePath || null;
  } catch (error) {
    console.error('Storage path 추출 오류:', {
      url: url.substring(0, 100), // URL 처음 100자만 로그
      error,
    });
    return null;
  }
}
