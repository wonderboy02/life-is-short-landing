'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Check } from 'lucide-react';

interface ShareUrlButtonProps {
  url: string;
  title?: string;
  text?: string;
}

export default function ShareUrlButton({ url, title = '추억 앨범', text = '함께 사진을 추가해보세요!' }: ShareUrlButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      // Web Share API 지원 확인 (모바일에서 주로 지원)
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url,
        });
        // 공유 성공 시 별도 피드백 없음 (네이티브 UI가 제공)
      } else {
        // Fallback: URL 복사
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      // 사용자가 공유를 취소한 경우 (AbortError)는 에러 표시 안 함
      if ((error as Error).name !== 'AbortError') {
        console.error('공유 실패:', error);
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
      {copied ? (
        <Check className="w-4 h-4" />
      ) : (
        <Share2 className="w-4 h-4" />
      )}
      <span>{copied ? '복사됨' : '공유'}</span>
    </Button>
  );
}
