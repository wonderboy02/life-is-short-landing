'use client';

import { Button } from '@/components/ui/button';
import KakaoChannelChatButton from '@/components/channel/KakaoChannelChatButton';

interface LandingBottomBarProps {
  /**
   * Primary 버튼 설정
   */
  primaryButton: {
    text: string;
    onClick: () => void;
    disabled?: boolean;
  };
}

export default function LandingBottomBar({ primaryButton }: LandingBottomBarProps) {
  return (
    <div className="fixed bottom-0 left-1/2 z-50 w-[min(428px,100vw)] -translate-x-1/2 border-t border-neutral-200 bg-white/80 backdrop-blur-sm">
      <div className="px-4 py-3">
        <div className="flex gap-2">
          {/* 카카오톡 1:1 상담 버튼 */}
          <KakaoChannelChatButton size="lg" className="h-12" />

          {/* Primary 버튼 */}
          <Button
            onClick={primaryButton.onClick}
            disabled={primaryButton.disabled}
            size="lg"
            className="flex-1 h-12"
          >
            {primaryButton.text}
          </Button>
        </div>
      </div>

      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
