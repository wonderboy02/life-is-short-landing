'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { isKakaoTalkWebView } from '@/lib/utils';

interface FirstVisitGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
}

export default function FirstVisitGuideModal({
  open,
  onOpenChange,
  shareUrl,
}: FirstVisitGuideModalProps) {
  const [copied, setCopied] = useState(false);

  // 카카오톡 공유 안내 이미지 프리로드
  useEffect(() => {
    const img = new Image();
    img.src = '/kakao_share_example_2.webp';
  }, []);

  const handleCopyUrl = async () => {
    try {
      const isKakao = isKakaoTalkWebView();

      // 카카오톡 웹뷰에서는 Web Share API 사용 안 함 (지원하지 않음)
      // Web Share API 지원 확인 (모바일에서 주로 지원) && 카카오톡이 아닐 때
      if (navigator.share && !isKakao) {
        await navigator.share({
          title: '추억 앨범',
          text: '함께 사진을 추가해보세요!',
          url: shareUrl,
        });
        // 공유 성공 시 별도 피드백 없음 (네이티브 UI가 제공)
      } else {
        // Fallback: URL 복사
        await navigator.clipboard.writeText(shareUrl);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-sm overflow-hidden rounded-lg p-3 sm:w-[90vw] sm:p-4 md:p-6">
        <DialogHeader className="min-w-0">
          <DialogTitle className="font-display text-xl font-bold text-neutral-900 md:text-2xl">
            추억 앨범이 만들어졌어요
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-600 md:text-base">
            가족들과 함께 소중한 순간들을 모아보세요
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 min-w-0 space-y-4 md:mt-6 md:space-y-6">
          {/* 안내사항 */}
          <div className="min-w-0 rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 sm:p-3 md:p-5">
            <div className="min-w-0 space-y-2 md:space-y-3">
              <div className="space-y-2 text-xs leading-relaxed text-neutral-600 md:space-y-2.5 md:text-sm">
                <p className="break-words">
                  링크를 가족들과 나눠보세요. 더 많은 사진이 모일수록, 부모님의 청춘이 더 생생하게
                  되살아나요.
                </p>
              </div>
            </div>
          </div>

          {/* URL 표시 및 복사 */}
          <div className="min-w-0 space-y-2 md:space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-neutral-800 md:text-sm">앨범 링크</label>
              <span className="text-[9px] text-neutral-500 md:text-[10px]">
                ※ 링크는 다시 찾을 수 없으니 바로 가족들과 공유해 보세요!
              </span>
            </div>
            <div className="flex min-w-0 gap-1.5 sm:gap-2">
              <div className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-neutral-300 bg-white px-2 py-2 text-xs whitespace-nowrap text-neutral-700 md:px-3 md:py-2.5 md:text-sm">
                {shareUrl}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyUrl}
                className="h-9 w-9 flex-shrink-0 border-neutral-300 md:h-10 md:w-10"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-neutral-600 md:h-4 md:w-4" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-neutral-600 md:h-4 md:w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="min-w-0 space-y-2 pt-1 md:space-y-3 md:pt-2">
            {/* 공유하기 버튼 (강조) */}
            <Button
              onClick={handleCopyUrl}
              className="h-11 w-full min-w-0 gap-1.5 bg-neutral-900 text-sm font-semibold hover:bg-neutral-800 sm:gap-2 md:h-12 md:text-base"
            >
              <Link2 className="h-3.5 w-3.5 flex-shrink-0 md:h-4 md:w-4" />
              <span className="truncate">가족들과 함께 모아보기</span>
            </Button>

            {/* 사진 업로드하기 버튼 */}
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="h-11 w-full min-w-0 border-neutral-300 text-sm font-medium hover:bg-neutral-50 md:h-12 md:text-base"
            >
              <span className="truncate">사진 업로드하기</span>
            </Button>
          </div>

          {/* 추가 안내 */}
          <p className="px-1 pt-1 text-center text-[10px] break-words text-neutral-400 md:text-xs">
            링크는 오른쪽 위 버튼에서 다시 확인할 수 있어요
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
