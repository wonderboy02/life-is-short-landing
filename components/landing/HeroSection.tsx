'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import HydrationLogger from './HydrationLogger';

interface HeroSectionProps {
  onShowCTA?: (show: boolean) => void;
}

export default function HeroSection({ onShowCTA }: HeroSectionProps) {
  // Hero animation states
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [processingMessageIndex, setProcessingMessageIndex] = useState(0);
  const [photosDisappeared, setPhotosDisappeared] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [ctaOpacity, setCtaOpacity] = useState(0);
  const [indicatorOpacity, setIndicatorOpacity] = useState(1);
  const [showPhotoGhost, setShowPhotoGhost] = useState(false);

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
    '사진의 화질을 올리고 있어요',
    'AI가 영상으로 변환 중이에요...',
    '정성을 담아 후보정하고 있어요...',
    '영상을 보내드리고 있어요...',
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
    }, 900);

    return () => clearInterval(interval);
  }, [showProcessing, showVideo, processingMessages.length]);

  // Show video after 3.6 seconds of processing
  useEffect(() => {
    if (!showProcessing) return;

    const timer = setTimeout(() => {
      setShowVideo(true);
      // Auto play video
      if (videoRef.current) {
        videoRef.current.play();
      }
    }, 3600);

    return () => clearTimeout(timer);
  }, [showProcessing]);

  // Show CTA when video appears
  useEffect(() => {
    if (showVideo) {
      setShowCTA(true);
      setCtaOpacity(1);
      onShowCTA?.(true);
    }
  }, [showVideo, onShowCTA]);

  // Show photo ghost 5 seconds after video appears
  useEffect(() => {
    if (!showVideo) return;

    const timer = setTimeout(() => {
      setShowPhotoGhost(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [showVideo]);

  // Fade out indicator when animation completes
  useEffect(() => {
    if (scrollProgress >= 0.9) {
      setIndicatorOpacity(0);
    }
  }, [scrollProgress]);

  return (
    <section ref={heroSectionRef} className="px-4 py-6">
      <HydrationLogger componentName="HeroSection" />
      <div className="mx-auto">
        {/* Text Content */}
        <div className="mb-16 space-y-6 text-left">
          <h1 className="font-display text-4xl leading-tight font-bold tracking-tight">
            <span className="block">앨범 속에</span>
            <span className="block">잠자던 사진들이</span>
            <span className="block">단 하나뿐인 선물로.</span>
          </h1>
          <p className="text-base text-pretty text-neutral-600">
            부모님의 청춘 시절, 그날에 멈춰버린 사진이<br></br>
            최신 AI와 전문가의 손길로 움직이는 영상이 되어 태어납니다.
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

              // 8.6초 후: 초기 위치에 희미하게 표시 (transition 없이 즉시)
              if (showPhotoGhost) {
                return (
                  <div
                    key={index}
                    className="aspect-square overflow-hidden rounded-lg bg-neutral-100"
                    style={{
                      transform: 'translate(0px, 0px) scale(1)',
                      opacity: 0.08,
                      transition: 'none',
                    }}
                  >
                    <img
                      src={`/hero/${index + 1}.webp`}
                      alt={`Photo ${index + 1}`}
                      loading={index < 3 ? 'eager' : 'lazy'}
                      className="h-full w-full object-cover"
                    />
                  </div>
                );
              }

              // 3.6초 후 영상이 뜬 후: opacity 0으로 고정 (스크롤 무시)
              if (showVideo) {
                return (
                  <div
                    key={index}
                    className="aspect-square overflow-hidden rounded-lg bg-neutral-100"
                    style={{
                      transform: 'translate(0px, 0px) scale(1)',
                      opacity: 0,
                      transition: 'none',
                    }}
                  >
                    <img
                      src={`/hero/${index + 1}.webp`}
                      alt={`Photo ${index + 1}`}
                      loading={index < 3 ? 'eager' : 'lazy'}
                      className="h-full w-full object-cover"
                    />
                  </div>
                );
              }

              // 스크롤 중: 스크롤 기반 애니메이션
              const translateX = scrollProgress * (-deltaCol * cellSize);
              const translateY = scrollProgress * (-deltaRow * cellSize + moveDistance);

              // opacity 계산: 0까지 완전히 사라짐
              const opacity =
                scrollProgress < 0.6 ? 1 : Math.max(0, 1 - (scrollProgress - 0.6) / 0.4);
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
                    src={`/hero/${index + 1}.webp`}
                    alt={`Photo ${index + 1}`}
                    loading={index < 3 ? 'eager' : 'lazy'}
                    className="h-full w-full object-cover"
                  />
                </div>
              );
            })}
          </div>

          {/* 스크롤 유도 인디케이터 */}
          <div
            className="mt-8 flex flex-col items-center gap-2 text-neutral-400"
            style={{
              opacity: indicatorOpacity,
              transition: 'opacity 0.3s ease-in-out',
            }}
          >
            <p className="text-sm">화면을 밑으로 내려보세요!</p>
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
            position: 'relative',
          }}
        >
          {/* Processing Message */}
          {!showVideo && showProcessing && (
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div className="flex flex-col items-center gap-4">
                <p className="text-lg font-semibold text-neutral-900">
                  {processingMessages[processingMessageIndex]}
                </p>
                {/* Progress Dots */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-2 w-2 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: index <= processingMessageIndex ? '#171717' : '#e5e5e5',
                        transform: index <= processingMessageIndex ? 'scale(1.2)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Video - Always rendered for preloading */}
          <div
            className="h-full w-full overflow-hidden rounded-2xl bg-neutral-100"
            style={{
              opacity: showVideo ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
            }}
          >
            <video
              ref={videoRef}
              src="/hero_video.mp4"
              loop
              muted
              playsInline
              autoPlay
              preload="auto"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Video Caption */}
        <p
          className="mt-3 text-center text-sm text-neutral-500"
          style={{
            opacity: showVideo ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
          }}
        >
          저희 팀이 직접 제작한 예시 영상입니다
        </p>

        {/* CTA Card - always rendered for space, opacity controlled */}
        <div
          className="mx-auto mt-8 mb-8"
          style={{
            maxWidth: '350px',
            opacity: ctaOpacity,
            transition: 'opacity 0.5s ease-in-out',
          }}
        >
          <div className="w-full space-y-4 rounded-2xl bg-white p-6 shadow-lg">
            {/* Headline */}
            <h2 className="text-center text-2xl leading-tight font-bold">
              부모님의 옛 사진들을
              <br />
              감동적인 1분 영상으로.
            </h2>

            {/* Value Props */}
            <div className="space-y-1 text-center text-neutral-600">
              <p className="text">구글의 최신 영상화 AI + 전문가의 편집</p>
              <p className="text">세상에 단 하나뿐인 감동적인 선물</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
