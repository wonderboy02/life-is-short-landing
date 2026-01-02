import { useState } from 'react';

type VideoStatus = 'pending' | 'requested' | 'processing' | 'completed' | 'failed' | null;

interface UseVideoStatusOptions {
  initialStatus: VideoStatus;
  groupId: string;
  token: string;
}

/**
 * 비디오 제작 상태 및 요청 관리 훅
 */
export function useVideoStatus({ initialStatus, groupId, token }: UseVideoStatusOptions) {
  const [videoStatus, setVideoStatus] = useState<VideoStatus>(initialStatus);

  const requestVideo = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/video`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setVideoStatus('requested');
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('영상 제작 요청 오류:', error);
      return { success: false, error: '서버 오류가 발생했습니다.' };
    }
  };

  return { videoStatus, setVideoStatus, requestVideo };
}
