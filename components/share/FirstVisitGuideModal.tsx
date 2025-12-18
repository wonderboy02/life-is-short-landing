'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Link2 } from 'lucide-react';

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

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[90vw] max-w-sm rounded-lg p-3 sm:p-4 md:p-6 overflow-hidden">
        <DialogHeader className="min-w-0">
          <DialogTitle className="text-xl md:text-2xl font-bold font-display text-neutral-900">
            추억 앨범이 만들어졌어요
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base text-neutral-600">
            가족들과 함께 소중한 순간들을 모아보세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6 mt-4 md:mt-6 min-w-0">
          {/* 안내사항 */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 sm:p-3 md:p-5 min-w-0">
            <div className="space-y-2 md:space-y-3 min-w-0">
              <p className="text-xs md:text-sm font-medium text-neutral-800">
                함께 만드는 추억
              </p>
              <div className="space-y-2 md:space-y-2.5 text-xs md:text-sm text-neutral-600 leading-relaxed">
                <p className="break-words">
                  링크를 가족들과 나눠보세요. 더 많은 사진이 모일수록, 부모님의 청춘이 더 생생하게 되살아나요.
                </p>
                <p className="text-[10px] md:text-xs text-neutral-500 break-words">
                  ※ 링크는 다시 찾을 수 없으니 꼭 보관해 주세요
                </p>
              </div>
            </div>
          </div>

          {/* URL 표시 및 복사 */}
          <div className="space-y-2 md:space-y-3 min-w-0">
            <label className="text-xs md:text-sm font-medium text-neutral-800">
              앨범 링크
            </label>
            <div className="flex gap-1.5 sm:gap-2 min-w-0">
              <div className="flex-1 min-w-0 bg-white border border-neutral-300 rounded-lg px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-sm text-neutral-700 overflow-x-auto whitespace-nowrap">
                {shareUrl}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyUrl}
                className="flex-shrink-0 h-9 w-9 md:h-10 md:w-10 border-neutral-300"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-neutral-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5 md:h-4 md:w-4 text-neutral-600" />
                )}
              </Button>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="space-y-2 md:space-y-3 pt-1 md:pt-2 min-w-0">
            {/* 공유하기 버튼 (강조) */}
            <Button
              onClick={handleCopyUrl}
              className="w-full h-11 md:h-12 text-sm md:text-base font-semibold bg-neutral-900 hover:bg-neutral-800 gap-1.5 sm:gap-2 min-w-0"
            >
              <Link2 className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="truncate">가족들과 공유하기</span>
            </Button>

            {/* 시작하기 버튼 */}
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="w-full h-11 md:h-12 text-sm md:text-base font-medium border-neutral-300 hover:bg-neutral-50 min-w-0"
            >
              <span className="truncate">시작하기</span>
            </Button>
          </div>

          {/* 추가 안내 */}
          <p className="text-[10px] md:text-xs text-center text-neutral-400 pt-1 break-words px-1">
            링크는 오른쪽 위 버튼에서 다시 확인할 수 있어요
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
