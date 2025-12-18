'use client';

import { useEffect, useState } from 'react';

export default function GlobalLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // 히어로 이미지 프리로드 (6개까지)
    const imagesToPreload = [
      '/hero/1.webp',
      '/hero/2.webp',
      '/hero/3.webp',
      '/hero/4.webp',
      '/hero/5.webp',
      '/hero/6.webp',
    ];
    let loadedCount = 0;
    const totalImages = imagesToPreload.length;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        // 최소 500ms 표시 (깜빡임 방지)
        setTimeout(() => {
          setIsLoading(false);
          // fade out 애니메이션 후 언마운트
          setTimeout(() => {
            setShouldRender(false);
          }, 300);
        }, 500);
      }
    };

    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.onload = checkAllLoaded;
      img.onerror = checkAllLoaded; // 에러가 나도 계속 진행
      img.src = src;
    });

    // 최대 3초 대기 (타임아웃)
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setTimeout(() => {
          setShouldRender(false);
        }, 300);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // 로딩 중에는 스크롤 잠금
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-300"
      style={{
        opacity: isLoading ? 1 : 0,
        pointerEvents: isLoading ? 'auto' : 'none',
      }}
    >
      {/* 도트 로딩 */}
      <div className="flex flex-col items-center gap-6">
        <p className="text-lg font-semibold text-neutral-900">
          추억을 선물하는 최고의 방법
        </p>

        {/* 도트 애니메이션 */}
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="loader-dot h-2.5 w-2.5 rounded-full bg-neutral-900"
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .loader-dot {
          animation: loaderPulse 1.4s ease-in-out infinite;
        }

        @keyframes loaderPulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
