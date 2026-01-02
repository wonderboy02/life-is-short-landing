import { useCallback, useRef } from 'react';

const HEADER_HEIGHT = 64; // h-16 = 64px

/**
 * 섹션으로 부드럽게 스크롤하는 훅
 */
export function useScrollToSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const scrollToSection = useCallback(() => {
    if (!sectionRef.current) return;

    const elementTop = sectionRef.current.getBoundingClientRect().top;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetPosition = scrollTop + elementTop - HEADER_HEIGHT;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    });
  }, []);

  return { sectionRef, scrollToSection };
}
