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
import { Copy, Check, Link2, MessageCircle, Share2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { isKakaoTalkWebView, isInAppBrowser, formatNameWithParticle } from '@/lib/utils';

interface FirstVisitGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
  creatorNickname?: string;
  shareCode?: string;
}

export default function FirstVisitGuideModal({
  open,
  onOpenChange,
  shareUrl,
  creatorNickname,
  shareCode,
}: FirstVisitGuideModalProps) {
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isKakaoReady, setIsKakaoReady] = useState(false);

  // Kakao SDK 로드 확인
  useEffect(() => {
    const checkKakao = () => {
      if (window.Kakao && window.Kakao.isInitialized()) {
        setIsKakaoReady(true);
      }
    };

    checkKakao();
    const interval = setInterval(checkKakao, 100);
    const timeout = setTimeout(() => clearInterval(interval), 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // 카카오톡으로 공유하기
  const handleKakaoShare = () => {
    if (window.Kakao && window.Kakao.isInitialized()) {
      try {
        // 메시지 제목 생성 (받침에 따라 "과"/"와" 선택)
        const messageTitle = creatorNickname
          ? `${formatNameWithParticle(creatorNickname)} 함께 옛날 사진 모으기`
          : '함께 옛날 사진 모으기';

        // 커스텀 템플릿 사용
        window.Kakao.Share.sendCustom({
          templateId: 127469,
          templateArgs: {
            CODE: shareCode || '',
            message_title: messageTitle,
            message_content: '옛날 사진을 모아서 영상으로 감동을 전합니다.',
          },
        });
      } catch (error) {
        console.error('카카오톡 공유 실패:', error);
        toast.error('카카오톡 공유에 실패했습니다');
      }
    } else {
      toast.error('카카오톡 공유 기능을 사용할 수 없습니다');
    }
  };

  // 링크 복사하기
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('링크가 복사되었습니다');
    } catch (error) {
      console.error('링크 복사 실패:', error);
      toast.error('링크 복사에 실패했습니다');
    }
  };

  // Web Share API 사용
  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: '추억 앨범',
        text: '함께 사진을 추가해보세요!',
        url: shareUrl,
      });
    } catch (error) {
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
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="h-11 w-full min-w-0 gap-1.5 bg-neutral-900 text-sm font-semibold hover:bg-neutral-800 sm:gap-2 md:h-12 md:text-base"
            >
              <Link2 className="h-3.5 w-3.5 flex-shrink-0 md:h-4 md:w-4" />
              <span className="truncate">가족들과 함께 모으기</span>
              <ChevronDown
                className={`h-3.5 w-3.5 flex-shrink-0 transition-transform md:h-4 md:w-4 ${
                  showShareOptions ? 'rotate-180' : ''
                }`}
              />
            </Button>

            {/* 공유 옵션 (펼쳐짐) */}
            {showShareOptions && (
              <div className="animate-in slide-in-from-top-2 space-y-2 duration-200">
                {/* 카카오톡으로 공유하기 */}
                {isKakaoReady && (
                  <Button
                    onClick={handleKakaoShare}
                    variant="outline"
                    size="lg"
                    className="flex h-12 w-full items-center justify-start gap-3 text-sm md:h-14 md:text-base"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 md:h-10 md:w-10">
                      <MessageCircle className="h-4 w-4 text-amber-900 md:h-5 md:w-5" />
                    </div>
                    <span className="font-medium">카카오톡으로 공유하기</span>
                  </Button>
                )}

                {/* 링크 복사하기 */}
                <Button
                  onClick={handleCopyUrl}
                  variant="outline"
                  size="lg"
                  className="flex h-12 w-full items-center justify-start gap-3 text-sm md:h-14 md:text-base"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 md:h-10 md:w-10">
                    <Copy className="h-4 w-4 text-blue-600 md:h-5 md:w-5" />
                  </div>
                  <span className="font-medium">{copied ? '복사됨!' : '링크 복사하기'}</span>
                </Button>

                {/* 다른 방법으로 공유하기 (웹뷰가 아닐 때만) */}
                {navigator.share && !isInAppBrowser() && (
                  <Button
                    onClick={handleNativeShare}
                    variant="outline"
                    size="lg"
                    className="flex h-12 w-full items-center justify-start gap-3 text-sm md:h-14 md:text-base"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 md:h-10 md:w-10">
                      <Share2 className="h-4 w-4 text-gray-600 md:h-5 md:w-5" />
                    </div>
                    <span className="font-medium">다른 방법으로 공유하기</span>
                  </Button>
                )}
              </div>
            )}

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
