import KakaoChannelChatButton from '@/components/channel/KakaoChannelChatButton';

export default function Header() {
  return (
    <header className="fixed top-0 left-1/2 z-50 w-[min(428px,100vw)] -translate-x-1/2 border-b border-neutral-100 bg-white/80 backdrop-blur-sm">
      <div className="px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 로고 - 폰트 크기 비율에 맞춰 반응형 (2.5배) */}
            <img
              src="/favicon/logo.png"
              alt="Life Is Short Logo"
              className="w-[clamp(2.03125rem,9.3vw,2.5rem)] h-[clamp(2.03125rem,9.3vw,2.5rem)]"
            />
            <span className="font-display text-lg font-semibold text-neutral-900">
              Life Is Short
            </span>
          </div>

          {/* 버튼 - 로고와 동일한 크기로 반응형 */}
          <KakaoChannelChatButton
            size="default"
            className="w-[clamp(2.03125rem,9.3vw,2.5rem)] h-[clamp(2.03125rem,9.3vw,2.5rem)]"
          />
        </div>
      </div>
    </header>
  );
}
