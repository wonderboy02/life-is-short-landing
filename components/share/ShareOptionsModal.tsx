'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle, Link2, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { isKakaoTalkWebView, isInAppBrowser } from '@/lib/utils';

interface ShareOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title?: string;
  text?: string;
}

export default function ShareOptionsModal({
  open,
  onOpenChange,
  url,
  title = '추억 앨범',
  text = '함께 사진을 추가해보세요!',
}: ShareOptionsModalProps) {
  const [copied, setCopied] = useState(false);
  const [isKakaoReady, setIsKakaoReady] = useState(false);

  // Kakao SDK 로드 확인
  useEffect(() => {
    const checkKakao = () => {
      if (window.Kakao && window.Kakao.isInitialized()) {
        setIsKakaoReady(true);
      }
    };

    checkKakao();
    // SDK가 늦게 로드될 수 있으므로 interval로 체크
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
        // 절대 URL 생성 (클라이언트에서는 window.location.origin 사용)
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const imageUrl = `${baseUrl}/favicon/logo.png`;

        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: '📸 ' + title,
            description: text,
            imageUrl: imageUrl,
            link: {
              mobileWebUrl: url,
              webUrl: url,
            },
          },
          buttons: [
            {
              title: '사진 추가하기',
              link: {
                mobileWebUrl: url,
                webUrl: url,
              },
            },
          ],
        });
        onOpenChange(false);
      } catch (error) {
        console.error('카카오톡 공유 실패:', error);
        toast.error('카카오톡 공유에 실패했습니다');
      }
    } else {
      toast.error('카카오톡 공유 기능을 사용할 수 없습니다');
    }
  };

  // 링크 복사하기
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('링크가 복사되었습니다');
      onOpenChange(false);
    } catch (error) {
      console.error('링크 복사 실패:', error);
      toast.error('링크 복사에 실패했습니다');
    }
  };

  // Web Share API 사용
  const handleNativeShare = async () => {
    const isKakao = isKakaoTalkWebView();

    if (navigator.share && !isKakao) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        onOpenChange(false);
      } catch (error) {
        // 사용자가 공유를 취소한 경우 (AbortError)는 에러 표시 안 함
        if ((error as Error).name !== 'AbortError') {
          console.error('공유 실패:', error);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">사진 같이모으기</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-4">
          {/* 카카오톡으로 공유하기 */}
          {isKakaoReady && (
            <Button
              onClick={handleKakaoShare}
              variant="outline"
              size="lg"
              className="flex h-14 items-center justify-start gap-3 text-base"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400">
                <MessageCircle className="h-5 w-5 text-amber-900" />
              </div>
              <span className="font-medium">카카오톡으로 링크 보내기</span>
            </Button>
          )}

          {/* 링크 복사하기 */}
          <Button
            onClick={handleCopyLink}
            variant="outline"
            size="lg"
            className="flex h-14 items-center justify-start gap-3 text-base"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Link2 className="h-5 w-5 text-blue-600" />
            </div>
            <span className="font-medium">{copied ? '복사됨!' : '링크 복사하기'}</span>
          </Button>

          {/* 다른 방법으로 공유하기 (Web Share API) */}
          {/* 웹뷰가 아니고 Web Share API가 지원되는 경우에만 표시 */}
          {navigator.share && !isInAppBrowser() && (
            <Button
              onClick={handleNativeShare}
              variant="outline"
              size="lg"
              className="flex h-14 items-center justify-start gap-3 text-base"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Share2 className="h-5 w-5 text-gray-600" />
              </div>
              <span className="font-medium">다른 방법으로 공유하기</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
