'use client';

import { useEffect } from 'react';

export default function PageLoadLogger() {
  useEffect(() => {
    // 페이지 로드 성능 측정
    if (typeof window !== 'undefined' && window.performance) {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      if (perfData) {
        const metrics = {
          'DNS 조회': perfData.domainLookupEnd - perfData.domainLookupStart,
          'TCP 연결': perfData.connectEnd - perfData.connectStart,
          'HTML 다운로드': perfData.responseEnd - perfData.responseStart,
          'DOM 파싱': perfData.domContentLoadedEventEnd - perfData.responseEnd,
          'DOM Interactive': perfData.domInteractive - perfData.fetchStart,
          '전체 로드': perfData.loadEventEnd > 0 ? perfData.loadEventEnd - perfData.fetchStart : 0,
        };

        console.log(
          '%c📊 페이지 로드 성능 분석',
          'color: #3b82f6; font-weight: bold; font-size: 14px; background: #dbeafe; padding: 4px 8px; border-radius: 4px;'
        );

        Object.entries(metrics).forEach(([key, value]) => {
          const time = value.toFixed(2);
          let emoji = '⚡';
          let color = '#10b981';

          if (value > 1000) {
            emoji = '🐌';
            color = '#ef4444';
          } else if (value > 500) {
            emoji = '⚠️';
            color = '#f59e0b';
          }

          console.log(
            `%c${emoji} ${key}: ${time}ms`,
            `color: ${color}; font-weight: 500;`
          );
        });

        console.log(
          '%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          'color: #e5e7eb;'
        );
      }
    }

    // First Contentful Paint (FCP)
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.log(
            '%c🎨 First Contentful Paint (FCP)',
            'color: #8b5cf6; font-weight: bold;',
            `\n⏱️  ${entry.startTime.toFixed(2)}ms`
          );
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
    } catch (e) {
      // Ignore if paint timing not supported
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
