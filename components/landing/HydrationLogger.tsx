'use client';

import { useEffect, useRef } from 'react';

interface HydrationLoggerProps {
  componentName: string;
}

export default function HydrationLogger({ componentName }: HydrationLoggerProps) {
  const startTimeRef = useRef<number>(0);

  // 컴포넌트가 마운트되기 전 (서버에서 렌더링된 직후)
  if (typeof window !== 'undefined' && startTimeRef.current === 0) {
    startTimeRef.current = performance.now();
  }

  useEffect(() => {
    // Hydration 완료 시점
    const hydrationTime = performance.now();
    const duration = hydrationTime - startTimeRef.current;

    console.log(
      `%c⚡ ${componentName} Hydration 완료`,
      'color: #10b981; font-weight: bold; font-size: 12px;',
      `\n⏱️  소요 시간: ${duration.toFixed(2)}ms`,
      `\n📊 완료 시각: ${hydrationTime.toFixed(2)}ms (페이지 로드 후)`
    );
  }, [componentName]);

  return null;
}
