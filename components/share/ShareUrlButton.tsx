'use client';

import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareUrlButtonProps {
  url: string;
  title?: string;
  text?: string;
}

export default function ShareUrlButton({ url, title = '추억 앨범', text = '함께 사진을 추가해보세요!' }: ShareUrlButtonProps) {
  const handleShare = async () => {
    try {
      // Web Share API 지원 확인 (모바일에서 주로 지원)
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url,
        });
        // 공유 성공 토스트 제거
      } else {
        // Fallback: URL 복사
        await navigator.clipboard.writeText(url);
        toast.success('URL이 복사되었습니다!');
      }
    } catch (error) {
      // 사용자가 공유를 취소한 경우 (AbortError)는 에러 표시 안 함
      if ((error as Error).name !== 'AbortError') {
        console.error('공유 실패:', error);
        toast.error('공유에 실패했습니다.');
      }
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Share2 className="w-4 h-4" />
      <span>공유</span>
    </Button>
  );
}
