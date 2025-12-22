'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { isKakaoTalkWebView } from '@/lib/utils';

interface ShareUrlButtonProps {
  url: string;
  title?: string;
  text?: string;
}

export default function ShareUrlButton({
  url,
  title = '추억 앨범',
  text = '함께 사진을 추가해보세요!',
}: ShareUrlButtonProps) {
  const [copied, setCopied] = useState(false);

  // 카카오톡 공유 안내 이미지 프리로드
  useEffect(() => {
    const img = new Image();
    img.src = '/kakao_share_example_2.webp';
  }, []);

  const handleShare = async () => {
    try {
      const isKakao = isKakaoTalkWebView();

      // 카카오톡 웹뷰에서는 Web Share API 사용 안 함 (지원하지 않음)
      // Web Share API 지원 확인 (모바일에서 주로 지원) && 카카오톡이 아닐 때
      if (navigator.share && !isKakao) {
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

        // 카카오톡 웹뷰에서는 풍성한 안내 토스트 표시
        if (isKakao) {
          toast.success('위 버튼을 눌러 가족들에게 공유해 보세요!', {
            description: (
              <div className="flex flex-col gap-2">
                <img
                  src="/kakao_share_example_2.webp"
                  alt="카카오톡 공유 방법"
                  className="mt-2 w-full rounded-lg border border-neutral-200"
                  style={{ aspectRatio: '1080/357' }}
                />
                <p className="text-center text-sm text-neutral-600">링크도 복사했어요!</p>
              </div>
            ),
            duration: 4000,
          });
        } else {
          // 일반 환경에서는 간단한 토스트
          toast.success('링크가 복사되었습니다');
        }
      }
    } catch (error) {
      // 사용자가 공유를 취소한 경우 (AbortError)는 에러 표시 안 함
      if ((error as Error).name !== 'AbortError') {
        console.error('공유 실패:', error);
      }
    }
  };

  return (
    <Button onClick={handleShare} variant="outline" size="sm" className="flex items-center gap-2">
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      <span>{copied ? '복사됨' : '공유'}</span>
    </Button>
  );
}
