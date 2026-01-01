'use client';

import { Button } from '@/components/ui/button';

interface ButtonConfig {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

interface FixedBottomBarProps {
  /**
   * 주 버튼 설정
   */
  primaryButton: ButtonConfig;
  /**
   * 보조 버튼 설정 (선택)
   */
  secondaryButton?: ButtonConfig;
}

export default function FixedBottomBar({
  primaryButton,
  secondaryButton,
}: FixedBottomBarProps) {
  return (
    <div className="fixed bottom-0 left-1/2 z-50 w-[min(428px,100vw)] -translate-x-1/2 border-t border-neutral-200 bg-white/80 backdrop-blur-sm">
      <div className="px-4 py-3">
        {/* 버튼 섹션 */}
        <div className="space-y-2">
          {/* Primary 버튼 */}
          <Button
            onClick={primaryButton.onClick}
            disabled={primaryButton.disabled}
            size="lg"
            className="w-full"
          >
            {primaryButton.text}
          </Button>

          {/* Secondary 버튼 (옵션) */}
          {secondaryButton && (
            <Button
              onClick={secondaryButton.onClick}
              disabled={secondaryButton.disabled}
              size="lg"
              variant={secondaryButton.disabled ? "outline" : "default"}
              className="w-full"
            >
              {secondaryButton.text}
            </Button>
          )}
        </div>
      </div>

      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
