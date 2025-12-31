'use client';

import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface FixedBottomBarProps {
  /**
   * 타이머에 표시할 시간 (목업용)
   */
  timerText?: string;
  /**
   * 버튼 텍스트
   */
  buttonText: string;
  /**
   * 버튼 클릭 핸들러
   */
  onButtonClick: () => void;
  /**
   * 버튼 비활성화 여부
   */
  disabled?: boolean;
  /**
   * 타이머 표시 여부
   */
  showTimer?: boolean;
}

export default function FixedBottomBar({
  timerText = '00:05:30',
  buttonText,
  onButtonClick,
  disabled = false,
  showTimer = true,
}: FixedBottomBarProps) {
  return (
    <div className="fixed bottom-0 left-1/2 z-50 w-[min(428px,100vw)] -translate-x-1/2 border-t border-neutral-200 bg-white/80 backdrop-blur-sm">
      <div className="px-4 py-3">
        {/* 타이머 섹션 */}
        {showTimer && (
          <div className="mb-2 flex items-center justify-center gap-1.5 text-sm text-neutral-600">
            <Clock className="h-4 w-4" />
            <span className="font-mono font-medium">{timerText}</span>
          </div>
        )}

        {/* 버튼 섹션 */}
        <Button
          onClick={onButtonClick}
          disabled={disabled}
          size="lg"
          className="w-full"
        >
          {buttonText}
        </Button>
      </div>

      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
