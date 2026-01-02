'use client';

import { useEffect, useState } from 'react';
import { MessageCircleQuestion } from 'lucide-react';
import { toast } from 'sonner';

interface KakaoChannelChatButtonProps {
  /**
   * 카카오톡 채널 Public ID
   * @default '_nrPgn'
   */
  channelPublicId?: string;
  /**
   * 버튼 크기
   * @default 'default'
   */
  size?: 'sm' | 'default' | 'lg';
  /**
   * 버튼 텍스트 표시 여부
   * @default false
   */
  showText?: boolean;
  /**
   * 커스텀 클래스명
   */
  className?: string;
}

export default function KakaoChannelChatButton({
  channelPublicId = '_nrPgn',
  size = 'default',
  showText = false,
  className = '',
}: KakaoChannelChatButtonProps) {
  const [isKakaoReady, setIsKakaoReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleClick = () => {
    if (!isKakaoReady) {
      toast.error('카카오톡 연결 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      window.Kakao.Channel.chat({
        channelPublicId,
      });

      // 카카오톡 창이 열리는 동안 로딩 표시 (2초)
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('카카오톡 채팅 열기 실패:', error);
      toast.error('카카오톡 상담을 시작할 수 없습니다');
      setIsLoading(false);
    }
  };

  // 사이즈별 스타일 (기본값, className으로 오버라이드 가능)
  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-9 w-9',
    lg: 'h-10 w-10',
  };

  // 아이콘 크기 - globals.css의 폰트 크기 비율(13:16)과 동일하게 조정
  const iconSizes = {
    sm: 'w-[clamp(0.975rem,3.72vw,1.2rem)] h-[clamp(0.975rem,3.72vw,1.2rem)]',
    default: 'w-[clamp(1.09rem,3.72vw,1.35rem)] h-[clamp(1.09rem,3.72vw,1.35rem)]',
    lg: 'w-[clamp(1.22rem,3.72vw,1.5rem)] h-[clamp(1.22rem,3.72vw,1.5rem)]',
  };

  if (!isKakaoReady) {
    return null; // SDK 로드 전에는 표시하지 않음
  }

  if (showText) {
    // 텍스트가 있는 버튼
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 rounded-lg border border-neutral-900 px-4 py-3 font-medium text-neutral-900 transition-colors duration-200 hover:bg-neutral-50 active:bg-neutral-100 ${
          isLoading ? 'bg-neutral-200 pointer-events-none' : 'bg-white'
        } ${className}`}
        aria-label="카카오톡 1:1 상담"
      >
        <MessageCircleQuestion className={iconSizes[size]} />
        <span>1:1 상담</span>
      </button>
    );
  }

  // 아이콘만 있는 버튼
  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center rounded-lg border border-neutral-900 transition-colors duration-200 hover:bg-neutral-50 active:bg-neutral-100 shrink-0 ${
        isLoading ? 'bg-neutral-200 pointer-events-none' : 'bg-white'
      } ${sizeClasses[size]} ${className}`}
      aria-label="카카오톡 1:1 상담"
    >
      <MessageCircleQuestion className={`${iconSizes[size]} text-neutral-900`} />
    </button>
  );
}
