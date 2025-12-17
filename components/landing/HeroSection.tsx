'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import HydrationLogger from './HydrationLogger';

export default function HeroSection() {
  // Hero animation states
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [processingMessageIndex, setProcessingMessageIndex] = useState(0);
  const [photosDisappeared, setPhotosDisappeared] = useState(false);

  const heroSectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 수동 스크롤 계산 (state로 관리)
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!gridRef.current || !videoContainerRef.current) {
        return;
      }

      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;

      // 페이지 내 절대 위치
      const gridTop = gridRef.current.offsetTop;
      const videoTop = videoContainerRef.current.offsetTop;

      // 진행도 0: 그리드 상단이 뷰포트 상단에서 20% 위치
      const startScroll = gridTop - viewportHeight * 0.2;

      // 진행도 1: 비디오 상단이 뷰포트 상단에서 50% 위치 (화면 중앙)
      const endScroll = videoTop - viewportHeight * 0.5;

      // 진행도 계산
      const progress = (scrollY - startScroll) / (endScroll - startScroll);
      const clampedProgress = Math.max(0, Math.min(1, progress));

      setScrollProgress(clampedProgress);

      // 사진이 완전히 사라진 후 (진행도 >= 1) 상태 고정
      if (clampedProgress >= 1 && !photosDisappeared) {
        setPhotosDisappeared(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 초기 실행

    return () => window.removeEventListener('scroll', handleScroll);
  }, [photosDisappeared]);

  // Processing messages
  const processingMessages = [
    '영상 처리중...',
    'AI가 작업하고 있어요...',
    '추억을 되살리는 중...',
    '곧 완성됩니다...',
  ];

  // Monitor scroll progress for animation completion
  useEffect(() => {
    if (scrollProgress >= 0.9 && !isAnimationComplete) {
      setIsAnimationComplete(true);
      setShowProcessing(true);
    }
  }, [scrollProgress, isAnimationComplete]);

  // Processing message rotation
  useEffect(() => {
    if (!showProcessing || showVideo) return;

    const interval = setInterval(() => {
      setProcessingMessageIndex((prev) => (prev + 1) % processingMessages.length);
    }, 800);

    return () => clearInterval(interval);
  }, [showProcessing, showVideo, processingMessages.length]);

  // Show video after 2 seconds of processing
  useEffect(() => {
    if (!showProcessing) return;

    const timer = setTimeout(() => {
      setShowVideo(true);
      // Auto play video
      if (videoRef.current) {
        videoRef.current.play();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [showProcessing]);

  return (
    <section ref={heroSectionRef} className="container mx-auto px-4 py-6 sm:px-6">
      <HydrationLogger componentName="HeroSection" />
      <div className="mx-auto max-w-md">
        {/* Text Content */}
        <div className="mb-16 space-y-6 text-left">
          <h1 className="font-display text-4xl leading-tight font-bold tracking-tight">
            <span className="block">앨범 속에</span>
            <span className="block">잠자던 사진들이</span>
            <span className="block">단 하나뿐인 선물로.</span>
          </h1>
          <p className="text-base text-pretty text-neutral-600">
            부모님의 청춘 시절, 그날에 멈춰버린 사진이<br></br>
            최신 AI 와 전문가의 손길로 움직이는 영상이 되어 태어납니다.
          </p>
        </div>

        {/* Photo Grid */}
        <div ref={gridRef} className="mx-auto mb-16" style={{ maxWidth: '350px' }}>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, index) => {
              // Row and column position
              const row = Math.floor(index / 3);
              const col = index % 3;

              // Calculate distance from center
              const centerRow = 1;
              const centerCol = 1;
              const deltaRow = row - centerRow;
              const deltaCol = col - centerCol;

              // Mobile-optimized values
              const cellSize = 110;
              const moveDistance = 300;

              // 스타일 직접 계산
              const translateX = scrollProgress * (-deltaCol * cellSize);
              const translateY = scrollProgress * (-deltaRow * cellSize + moveDistance);

              // opacity 계산: 한번 사라지면 계속 0 유지
              const opacity = photosDisappeared
                ? 0
                : scrollProgress < 0.6
                  ? 1
                  : 1 - (scrollProgress - 0.6) / 0.4;
              const scale = 1 - scrollProgress * 0.1;

              return (
                <div
                  key={index}
                  className="aspect-square overflow-hidden rounded-lg bg-neutral-100"
                  style={{
                    transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                    opacity: opacity,
                    transition: 'none',
                    willChange: 'transform, opacity',
                  }}
                >
                  <img
                    src="/placeholder_1.png"
                    alt={`Photo ${index + 1}`}
                    loading={index < 3 ? 'eager' : 'lazy'}
                    className="h-full w-full object-cover"
                  />
                </div>
              );
            })}
          </div>

          {/* 스크롤 유도 인디케이터 */}
          <div className="mt-8 flex flex-col items-center gap-2 text-neutral-400">
            <p className="text-sm">영상 제작하기</p>
            <ChevronDown className="h-6 w-6 animate-bounce" />
          </div>
        </div>

        {/* Video Container */}
        <div
          ref={videoContainerRef}
          className="mx-auto flex items-center justify-center"
          style={{
            width: '80vw',
            maxWidth: '350px',
            aspectRatio: '1 / 1',
            minHeight: '280px',
          }}
        >
          {!showVideo && showProcessing && (
            <div className="text-center">
              <p className="text-lg font-semibold text-neutral-900">
                {processingMessages[processingMessageIndex]}
              </p>
            </div>
          )}
          {showVideo && (
            <div className="h-full w-full overflow-hidden rounded-2xl bg-neutral-100">
              <video
                ref={videoRef}
                src="/hero_example_merged.mp4"
                loop
                muted
                playsInline
                autoPlay
                preload="auto"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
