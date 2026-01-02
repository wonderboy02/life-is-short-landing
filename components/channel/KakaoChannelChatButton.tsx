'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
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

    try {
      window.Kakao.Channel.chat({
        channelPublicId,
      });
    } catch (error) {
      console.error('카카오톡 채팅 열기 실패:', error);
      toast.error('카카오톡 상담을 시작할 수 없습니다');
    }
  };

  // 사이즈별 스타일
  const sizeClasses = {
    sm: 'h-10 w-10',
    default: 'h-12 w-12',
    lg: 'h-14 w-14',
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    default: 'h-6 w-6',
    lg: 'h-7 w-7',
  };

  if (!isKakaoReady) {
    return null; // SDK 로드 전에는 표시하지 않음
  }

  if (showText) {
    // 텍스트가 있는 버튼
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-3 font-medium text-amber-900 transition-all hover:bg-yellow-500 active:scale-95 ${className}`}
        aria-label="카카오톡 1:1 상담"
      >
        <MessageCircle className={iconSizes[size]} />
        <span>1:1 상담</span>
      </button>
    );
  }

  // 아이콘만 있는 버튼
  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center rounded-lg bg-yellow-400 transition-all hover:bg-yellow-500 active:scale-95 ${sizeClasses[size]} ${className}`}
      aria-label="카카오톡 1:1 상담"
    >
      <MessageCircle className={`${iconSizes[size]} text-amber-900`} />
    </button>
  );
}
