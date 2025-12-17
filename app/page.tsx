'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Script from 'next/script';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Upload,
  Play,
  ImageIcon,
  Palette,
  Video,
  MessageCircle,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Marquee from 'react-fast-marquee';
import CreateGroupDialog from '@/components/landing/CreateGroupDialog';

export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'single' | 'story' | 'premium'>('story');
  const [expandedPlan, setExpandedPlan] = useState<'single' | 'story' | 'premium' | null>('story');

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadedImages((prev) => [...prev, event.target?.result as string]);
          setShowForm(true);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    if (uploadedImages.length === 1) {
      setShowForm(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber && agreedToTerms) {
      setIsSubmitted(true);
    }
  };

  const scrollToDemo = () => {
    setDialogOpen(true);
  };

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
  }, [scrollProgress, isAnimationComplete, photosDisappeared]);

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
    }, 2000);

    return () => clearTimeout(timer);
  }, [showProcessing]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-neutral-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <div className="flex items-center gap-3">
              <Image
                src="/favicon/logo.png"
                alt="Life Is Short Logo"
                width={40}
                height={40}
                priority
              />
              <span className="font-display text-lg font-semibold text-neutral-900">
                Life Is Short
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero + Demo Section */}
        <section ref={heroSectionRef} className="container mx-auto px-4 py-6 sm:px-6">
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
                      className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100"
                      style={{
                        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                        opacity: opacity,
                        transition: 'none',
                        willChange: 'transform, opacity',
                      }}
                    >
                      <Image
                        src="/placeholder_1.png"
                        alt={`Photo ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 110px, 110px"
                        className="object-cover"
                        priority
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
              style={{ width: '80vw', maxWidth: '350px', aspectRatio: '1 / 1' }}
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

        {/* Service Description Section */}
        <section className="bg-neutral-100 py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="font-display mb-8 text-center text-3xl font-bold text-neutral-900 md:mb-12 md:text-4xl">
                저희의 서비스는,
              </h2>
              <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-lg md:p-12">
                <div className="space-y-6">
                  <p className="text-lg leading-relaxed text-neutral-800 md:text-2xl md:leading-relaxed">
                    빛나는 청춘을 살아내신 부모님들의 옛 사진들을 <span> </span>
                    <br className="hidden md:block" />
                    최신 AI 기술을 통해
                    <span className="font-semibold text-neutral-900"> 움직이는 영상</span>으로
                    제작해드리는 서비스입니다.
                  </p>
                  <p className="text-lg leading-relaxed text-neutral-600 md:text-2xl md:leading-relaxed">
                    기술의 한계로 인해{' '}
                    <span className="font-semibold text-neutral-900">
                      사진으로만 추억을 남길 수 있던
                    </span>{' '}
                    부모님들께,
                    <br className="hidden md:block" />
                    아름다웠던 삶의 궤적에 빛을 더해 선물해보세요.
                  </p>
                  <p className="text-lg leading-relaxed text-neutral-600 md:text-2xl md:leading-relaxed">
                    뜻깊은 부모님의 <span className="font-semibold text-neutral-900">생신</span>에,{' '}
                    <br></br>
                    특별한{' '}
                    <span className="font-semibold text-neutral-900">
                      환갑, 칠순, 팔순 잔치
                    </span>에, <br></br>
                    부모님 두 분의{' '}
                    <span className="font-semibold text-neutral-900">결혼기념일</span>에, <br></br>
                    가족 모두 모인 <span> </span>
                    <span className="font-semibold text-neutral-900">
                      어버이날과 추석, 신년
                    </span>에 <br></br>그 어느 순간이라도 감동을 선물해보세요
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        {process.env.NEXT_PUBLIC_IS_BETA_TEST !== 'true' && (
          <section className="overflow-hidden py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center md:mb-16">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2">
                  <span className="text-3xl font-bold text-neutral-900">1,247</span>
                  <span className="text-neutral-600">명의 사용자</span>
                </div>
                <h2 className="font-display mb-4 text-3xl font-bold md:text-4xl">
                  직접 감동을 선물해본 <br className="inline md:hidden"></br> 이들의 경험담
                </h2>
                <p className="text-lg text-neutral-600">
                  실제 사용자분들이 대가 없이 남겨주신 피드백이에요.
                </p>
              </div>

              <Marquee gradient={false} speed={40} className="py-4">
                {/* Review 1 */}
                <div className="mx-3 w-[280px] rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm md:p-8">
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-5 w-5 fill-yellow-400" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mb-6 leading-relaxed text-neutral-700">
                    어머니가 정말 좋아하셨어요. 영상 보시면서 많이 우셨습니다.
                  </p>
                  <div className="text-sm text-neutral-600">박*영 (43세, 여)</div>
                </div>

                {/* Review 2 */}
                <div className="mx-3 w-[280px] rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm md:p-8">
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-5 w-5 fill-yellow-400" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mb-6 leading-relaxed text-neutral-700">
                    아버지 젊으셨을 때 모습을 처음 봤어요. 가족들이 다 감동했습니다.
                  </p>
                  <div className="text-sm text-neutral-600">김*수 (47세, 남)</div>
                </div>

                {/* Review 3 */}
                <div className="mx-3 w-[280px] rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm md:p-8">
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-5 w-5 fill-yellow-400" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mb-6 leading-relaxed text-neutral-700">
                    부모님 두 분 다 너무 좋아하셨어요. 감사합니다.
                  </p>
                  <div className="text-sm text-neutral-600">이*희 (51세, 여)</div>
                </div>

                {/* Review 4 */}
                <div className="mx-3 w-[280px] rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm md:p-8">
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-5 w-5 fill-yellow-400" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mb-6 leading-relaxed text-neutral-700">
                    흑백 사진이었는데 색이 입혀지니 신기했어요. 어머니가 계속 보고 계세요.
                  </p>
                  <div className="text-sm text-neutral-600">최*민 (45세, 남)</div>
                </div>

                {/* Review 5 */}
                <div className="mx-3 w-[280px] rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm md:p-8">
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-5 w-5 fill-yellow-400" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mb-6 leading-relaxed text-neutral-700">
                    아버지 생신 선물로 드렸는데 정말 좋아하셨습니다.
                  </p>
                  <div className="text-sm text-neutral-600">정*아 (49세, 여)</div>
                </div>

                {/* Review 6 */}
                <div className="mx-3 w-[280px] rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm md:p-8">
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-5 w-5 fill-yellow-400" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mb-6 leading-relaxed text-neutral-700">
                    결과물이 기대 이상이었어요. 부모님이 매우 만족하셨습니다.
                  </p>
                  <div className="text-sm text-neutral-600">윤*호 (44세, 남)</div>
                </div>
              </Marquee>
            </div>
          </section>
        )}

        <section className="border-y border-neutral-100 bg-white py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 text-center md:mb-20">
                <h2 className="font-display mb-4 text-3xl font-bold md:text-5xl">
                  저희는 이렇게 <br className="inline md:hidden"></br>추억을 되살려 드려요
                </h2>
                <p className="text-xl text-neutral-600">
                  추억이 온전히 되살아날 수 있도록, <br></br>저희 팀의 기술을 최대한 활용하고
                  있어요.
                </p>
              </div>

              <div className="space-y-8 md:space-y-12">
                {/* Step 1 */}
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-20">
                  <div className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
                    <div className="relative mx-auto w-48 md:mx-0 md:w-64">
                      <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-md">
                        <Image
                          src="/process_1.jpg"
                          alt="사진 촬영"
                          fill
                          sizes="(max-width: 768px) 192px, 256px"
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                      {/* Step number overlay */}
                      <div className="absolute -top-3 -left-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-xl font-bold text-white shadow-lg">
                        하나
                      </div>
                    </div>
                    <div className="space-y-3 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5">
                        <ImageIcon className="h-4 w-4 text-neutral-700" />
                        <span className="text-sm font-medium">사진 준비</span>
                      </div>
                      <h3 className="font-display text-xl font-bold md:text-4xl">
                        소중한 사진을 받아 검수해요
                      </h3>
                      <p className="text-base text-lg leading-relaxed text-neutral-600 md:text-xl">
                        추억이 담긴 사진들은 훼손되거나, 빛바랜 경우가 많아요.
                        <br></br>
                        하지만 걱정하지 마세요.
                        <br></br>그런 사진들도 휴대폰 카메라로 찍어서 보내주시면 저희가 검수를
                        도와드려요.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-20">
                  <div className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
                    <div className="order-2 space-y-3 text-center md:order-1 md:text-left">
                      <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5">
                        <Palette className="h-4 w-4 text-neutral-700" />
                        <span className="text-sm font-medium">AI 화질 복원</span>
                      </div>
                      <h3 className="font-display text-xl font-bold md:text-4xl">
                        최신 AI를 활용해
                        <br />
                        사진을 최상의 품질로 복원해요
                      </h3>
                      <p className="text-base text-lg leading-relaxed text-neutral-600 md:text-xl">
                        추억의 해상도는 생생해야 하는 법이에요.
                        <br></br>Google의 Nano banana Pro AI를 이용해 <br></br>"업스케일링"이라는
                        과정을 거쳐요. <br></br>사진의 찢어져 사라진 부분, 흐려진 부분 등을
                        복원하고, 사진의 화질을 올려요.
                      </p>
                    </div>
                    <div className="relative order-1 mx-auto w-48 md:order-2 md:mx-0 md:ml-auto md:w-64">
                      <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-md">
                        <Image
                          src="/process_2.jpeg"
                          alt="AI 화질 복원"
                          fill
                          sizes="(max-width: 768px) 192px, 256px"
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute -top-3 -right-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-xl font-bold text-white shadow-lg">
                        둘
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-20">
                  <div className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
                    <div className="relative mx-auto w-48 md:mx-0 md:w-64">
                      <div className="aspect-[2/3] overflow-hidden rounded-xl shadow-md">
                        <video
                          src="/process_3.mp4"
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="absolute -top-3 -left-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-xl font-bold text-white shadow-lg">
                        셋
                      </div>
                    </div>
                    <div className="space-y-3 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5">
                        <Video className="h-4 w-4 text-neutral-700" />
                        <span className="text-sm font-medium">영상 제작</span>
                      </div>
                      <h3 className="font-display text-xl font-bold md:text-4xl">
                        첨단 AI 기술을 활용해
                        <br />
                        복원된 사진을 영상으로 바꿔요
                      </h3>
                      <p className="text-base leading-relaxed text-neutral-600 md:text-xl">
                        Google의 검증된 AI 엔진과, 다수의 작업을 거쳐본 저희의 노하우로 영상화
                        작업을 진행해요. 결과물이 만족스러울 때까지, 시행착오를 아끼지 않아요.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-20">
                  <div className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
                    <div className="order-2 space-y-3 text-center md:order-1 md:text-left">
                      <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5">
                        <MessageCircle className="h-4 w-4 text-neutral-700" />
                        <span className="text-sm font-medium">카카오톡 전송</span>
                      </div>
                      <h3 className="font-display text-xl font-bold md:text-4xl">
                        영상은 물론, 복원된 사진까지 <br></br>원본 화질로 함께 보내드려요
                      </h3>
                      <p className="text-base leading-relaxed text-neutral-600 md:text-xl">
                        하루 정도 소요되니 조금만 기다려주세요.<br></br> 완성된 영상과 함께 복원된
                        사진들도 <br></br> 원본 화질로 모두 보내드립니다.
                      </p>
                    </div>
                    <div className="relative order-1 mx-auto w-48 md:order-2 md:mx-0 md:ml-auto md:w-64">
                      <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-md">
                        <Image
                          src="/kakao.png"
                          alt="카카오톡 전송"
                          fill
                          sizes="(max-width: 768px) 192px, 256px"
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute -top-3 -right-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-xl font-bold text-white shadow-lg">
                        넷
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Beta Test CTA Section */}
        {process.env.NEXT_PUBLIC_IS_BETA_TEST === 'true' && (
          <section className="container mx-auto px-4 py-20 sm:px-6 md:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl">
              {/* 얼리버드 배지 */}
              <div className="mb-10 flex justify-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-5 py-2.5">
                  <span className="text-xl">✨</span>
                  <span className="text-sm font-semibold text-neutral-700">
                    얼리 테스터 모집 중
                  </span>
                </div>
              </div>

              {/* 메인 카피 */}
              <h2 className="font-display mb-4 text-center text-3xl leading-tight font-bold tracking-tight text-neutral-900 md:text-5xl">
                세상 어디에도 없던
                <br />
                특별한 경험을 무료로
              </h2>

              {/* 서브 카피 */}
              <p className="mb-10 text-center text-base leading-relaxed text-neutral-600 md:text-lg">
                부모님의 청춘을 되살리는 유일한 서비스.
                <br className="md:hidden" /> 지금 베타 테스터로 먼저 경험하세요.
              </p>

              {/* 가격 카드 */}
              <div className="mb-5 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-10">
                {/* 가격 비교 */}
                <div className="mb-6">
                  <div className="mb-5 flex items-center justify-center gap-3">
                    <div className="text-center">
                      <p className="mb-1 text-xs font-medium text-neutral-500">정가</p>
                      <p className="text-2xl font-bold text-neutral-400 line-through md:text-3xl">
                        25,000원
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-neutral-300 md:text-3xl">→</div>
                    <div className="text-center">
                      <p className="mb-1 text-xs font-medium text-neutral-500">베타 테스터</p>
                      <p className="text-4xl font-bold text-neutral-900 md:text-5xl">0원</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-neutral-50 p-5">
                    <p className="mb-3 text-center text-sm font-semibold text-neutral-700">
                      포함된 서비스
                    </p>
                    <ul className="space-y-2.5 text-sm text-neutral-600">
                      <li className="flex items-start gap-2.5">
                        <span className="mt-0.5 text-neutral-900">•</span>
                        <span>사진 10장까지 완전 무료 제작</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="mt-0.5 text-neutral-900">•</span>
                        <span>AI 화질 복원 & 컬러라이제이션</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="mt-0.5 text-neutral-900">•</span>
                        <span>감성 영상 제작 및 카카오톡 전송</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="mt-0.5 text-neutral-900">•</span>
                        <span>결제 정보 입력 없이 바로 체험</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* CTA 버튼 */}
              <div className="space-y-4">
                <Button
                  size="lg"
                  onClick={scrollToDemo}
                  className="h-14 w-full rounded-xl bg-neutral-900 text-lg font-semibold text-white transition-all hover:bg-neutral-800 md:h-16 md:text-xl"
                >
                  지금 무료로 만들어보기
                </Button>

                <p className="text-center text-sm text-neutral-500">
                  베타 기간 종료 시 유료로 전환됩니다
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Pricing Section */}
        {process.env.NEXT_PUBLIC_IS_BETA_TEST !== 'true' && (
          <section className="container mx-auto bg-gradient-to-b from-white to-neutral-50 px-4 py-16 sm:px-6 md:py-24 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <div className="mb-12 text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2">
                  <span className="text-sm font-semibold text-red-600">출시 기념 특가</span>
                  <span className="text-xs text-red-500">최대 60% 할인</span>
                </div>
                <h2 className="font-display mb-3 text-3xl font-bold md:text-4xl">
                  소중한 추억을 되살려보세요
                </h2>
              </div>

              <div className="space-y-3">
                {/* 단품 제작 */}
                <div
                  className={`cursor-pointer rounded-2xl border-2 bg-white transition-all ${
                    selectedPlan === 'single'
                      ? 'border-neutral-900 shadow-md'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  onClick={() => {
                    setSelectedPlan('single');
                    setExpandedPlan(expandedPlan === 'single' ? null : 'single');
                  }}
                >
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                          selectedPlan === 'single'
                            ? 'border-neutral-900 bg-neutral-900'
                            : 'border-neutral-300'
                        }`}
                      >
                        {selectedPlan === 'single' && <Check className="h-4 w-4 text-white" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">단품 제작</h3>
                        <p className="text-sm text-neutral-500">원하는 만큼만</p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-neutral-400 transition-transform ${
                        expandedPlan === 'single' ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  {expandedPlan === 'single' && (
                    <div className="border-t border-neutral-100 px-5 pt-2 pb-5">
                      <div className="mb-4">
                        <div className="mb-1 flex items-baseline gap-2">
                          <span className="text-sm text-neutral-400 line-through">3,000원</span>
                          <span className="text-2xl font-bold text-neutral-900">1,500원</span>
                          <span className="text-sm text-neutral-600">/장</span>
                        </div>
                        <span className="inline-block rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                          50% 할인
                        </span>
                      </div>

                      <ul className="mb-4 space-y-2 text-sm text-neutral-600">
                        <li className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          <span>사진 1장당 최대 8초로 영상화</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          <span>AI 화질 복원 및 컬러 추가</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          <span>고품질 이미지 전송</span>
                        </li>
                      </ul>

                      <Button
                        size="lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollToDemo();
                        }}
                        className="w-full bg-neutral-900 px-10 py-6 text-lg text-white hover:bg-neutral-800"
                      >
                        바로 제작하기
                      </Button>
                    </div>
                  )}
                </div>

                {/* 청춘 스토리 (기본 선택 & 펼쳐짐) */}
                <div
                  className={`relative cursor-pointer overflow-visible rounded-2xl border-2 bg-white transition-all ${
                    selectedPlan === 'story'
                      ? 'border-neutral-900 shadow-lg'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  onClick={() => {
                    setSelectedPlan('story');
                    setExpandedPlan(expandedPlan === 'story' ? null : 'story');
                  }}
                >
                  {/* 인기 배지 */}
                  <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                    <div className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-4 py-1 text-xs font-bold text-red-600 shadow-lg">
                      가장 인기
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-5 pt-7">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                          selectedPlan === 'story'
                            ? 'border-neutral-900 bg-neutral-900'
                            : 'border-neutral-300'
                        }`}
                      >
                        {selectedPlan === 'story' && <Check className="h-4 w-4 text-white" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">다시 돌아온 청춘 스토리</h3>
                        <p className="text-sm text-neutral-500">가장 많이 선택하는</p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-neutral-400 transition-transform ${
                        expandedPlan === 'story' ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  {expandedPlan === 'story' && (
                    <div className="border-t border-neutral-100 px-5 pt-2 pb-5">
                      <div className="mb-4 rounded-xl p-4">
                        <div className="mb-3 text-center">
                          <div className="mb-1 text-2xl font-bold">🎬 사진 10장 → 1분 영상</div>
                        </div>
                        <div className="mb-1 flex items-baseline justify-center gap-2">
                          <span className="text-lg text-neutral-400 line-through">30,000원</span>
                          <span className="text-3xl font-bold text-neutral-900">12,900원</span>
                        </div>
                        <div className="text-center">
                          <span className="inline-block rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                            57% 할인
                          </span>
                          <p className="mt-2 text-xs text-neutral-500">장당 1,290원</p>
                        </div>
                      </div>

                      {/* 차별화 포인트 */}
                      {/* <div className="mb-5 rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
                      <div className="text-center">
                        <div className="mb-2 text-lg font-bold text-neutral-900">
                          🎬 이제까지 없던 새로운 방식
                        </div>
                        <p className="text-sm leading-relaxed text-neutral-700">
                          단순한 복원이 아닙니다.
                          <br />
                          인생의 흐름이 하나의 영상이 되어
                          <br />
                          추억이 눈앞에 돌아옵니다.
                        </p>
                      </div>
                    </div> */}

                      {/* 영상 미리보기 */}
                      <div className="mb-5 overflow-hidden rounded-xl bg-neutral-900">
                        <video
                          src="/story_video.mp4"
                          controls
                          preload="metadata"
                          poster="/story_video_poster.jpg"
                          playsInline
                          className="w-full"
                          style={{ maxHeight: '500px' }}
                        />
                      </div>

                      <ul className="mb-5 space-y-2.5 text-sm">
                        <li className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          <span className="text-neutral-700">
                            여러 추억을 하나의 감동적인 스토리로
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          <span className="text-neutral-700">감성 음악과 함께 1분 영상 제작</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          <span className="text-neutral-700">
                            AI 화질 복원 및 자연스러운 컬러 추가
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          <span className="text-neutral-700">부모님이 가장 좋아하시는 구성</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          <span className="text-neutral-700">카카오톡으로 간편하게 전송</span>
                        </li>
                      </ul>

                      <Button
                        size="lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollToDemo();
                        }}
                        className="w-full bg-neutral-900 px-10 py-6 text-lg text-white hover:bg-neutral-800"
                      >
                        바로 제작하기
                      </Button>
                    </div>
                  )}
                </div>

                {/* 프리미엄 패키지 */}
                <div
                  className={`cursor-pointer rounded-2xl border-2 bg-white transition-all ${
                    selectedPlan === 'premium'
                      ? 'border-neutral-900 shadow-md'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  onClick={() => {
                    setSelectedPlan('premium');
                    setExpandedPlan(expandedPlan === 'premium' ? null : 'premium');
                  }}
                >
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                          selectedPlan === 'premium'
                            ? 'border-neutral-900 bg-neutral-900'
                            : 'border-neutral-300'
                        }`}
                      >
                        {selectedPlan === 'premium' && <Check className="h-4 w-4 text-white" />}
                      </div>
                      <div>
                        <h3 className="flex items-center gap-2 text-lg font-semibold">
                          프리미엄 패키지
                        </h3>
                        <p className="text-sm text-neutral-500">가장 큰 감동</p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-neutral-400 transition-transform ${
                        expandedPlan === 'premium' ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  {expandedPlan === 'premium' && (
                    <div className="border-t border-neutral-100 px-5 pt-2 pb-5">
                      <div className="mb-4 rounded-xl p-4">
                        <div className="mb-3 text-center">
                          <div className="mb-1 text-2xl font-bold">🎥 사진 20장 → 2분 영상</div>
                        </div>
                        <div className="mb-1 flex items-baseline justify-center gap-2">
                          <span className="text-lg text-neutral-400 line-through">50,000원</span>
                          <span className="text-3xl font-bold text-neutral-900">19,900원</span>
                        </div>
                        <div className="text-center">
                          <span className="inline-block rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                            60% 할인
                          </span>
                          <p className="mt-2 text-xs text-neutral-500">장당 995원</p>
                        </div>
                      </div>

                      <ul className="mb-5 space-y-2.5 text-sm">
                        <li className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          <span className="text-neutral-700">
                            더 많은 추억, 더 긴 감동의 2분 영상
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          <span className="text-neutral-700">프리미엄 음악과 고급 편집</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          <span className="text-neutral-700">
                            AI 화질 복원 및 자연스러운 컬러 추가
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          <span className="text-neutral-700">부모님께 가장 큰 감동 선물</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          <span className="text-neutral-700">장당 최저가 (995원)</span>
                        </li>
                      </ul>

                      <Button
                        size="lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollToDemo();
                        }}
                        className="w-full bg-neutral-900 px-10 py-6 text-lg text-white hover:bg-neutral-800"
                      >
                        바로 제작하기
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-6 text-center text-xs text-neutral-500">
                * 출시 기념 특가는 조기 마감될 수 있습니다
              </p>
            </div>
          </section>
        )}

        {/* Brand Story Section */}
        <section className="border-y border-neutral-100 bg-neutral-50 py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <div className="mb-8 text-center md:mb-12">
                <h2 className="font-display lack-600 mb-6 border-b border-b-5 border-dotted pb-10 text-3xl leading-tight font-bold md:text-4xl">
                  Life Is Short's <span className="text-xl">Brand Story</span>
                </h2>
              </div>

              <div className="mx-7 space-y-1 text-base leading-relaxed text-neutral-700 md:text-lg md:leading-relaxed">
                <p>
                  안녕하세요. <br></br>Life is Short 서비스를 공동으로 기획하고 운영 중인
                  김태양이라고 합니다.
                </p>
                <br></br>
                <p>
                  저희 서비스를 재밌게 보셨나요? 어쩌면 조금은 생소하게도, 조금은 놀랍게도 느껴졌을
                  것 같습니다. 저희가 숨결을 불어넣은 영상들은 여태껏 많은 고객님들에게 감동을
                  선물했습니다. 그게 저희 팀의 커다란 자부심 중 하나이기도 하고요.
                </p>
                <br></br>
                <p>이 서비스가 어쩌다가 세상에 태어났을까요?</p>
                <p className="font-semibold text-neutral-900">
                  사실, 저희 어머니께서 참 좋아하시더라고요.
                </p>
                <br></br>
                <p>어머니와 함께 핸드폰 갤러리를 돌아보던 어느 주말, 어머니께서 말씀하셨습니다.</p>
                <p className="text-neutral-600 italic">"아 이때 영상이 있었으면 참 좋았을 텐데."</p>
                <br></br>
                <p>
                  그때 저는 제가 능숙하게 다룰 줄 아는 인공지능을 이용해보기로 마음 먹었습니다. 한두
                  시간 정도 여러 차례 영상화 작업을 시도해본 뒤, 어머니께 보여드렸습니다. 제가
                  평소에 장난기가 많아서, 다소 장난스럽게 영상을 만들었었죠. 그렇게 완성된 영상이
                  바로 지금 옆에서 여러분께서 보고 계신 영상입니다. 어머니께서 놀라시면서도 아주
                  기뻐하셨습니다. 몇 번씩이고 영상을 돌려보시더라고요.
                </p>
                <br></br>
                <p className="font-semibold text-neutral-900">"이거다" 싶었습니다.</p>
                <p>
                  제 부모님 뿐만 아니라 다른 사람들에게도 가치를, 만족을 줄 수 있는 방법. 저는
                  곧바로 팀원과 함께 서비스를 기획했고, 끝내 이렇게 여러분들께 인사드리고 있습니다.
                </p>
                <br></br>
                <p>
                  가족분들과 한 번 더 웃고, 한 번 더 포옹하고, 한 번 더 행복할 수 있는 계기가
                  되었으면 좋겠습니다. 오늘도, 내일도 행복하시기를 바랍니다.
                </p>
                <p className="mt-8 text-right font-medium text-neutral-800">김태양 올림</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100 bg-neutral-50">
        <div className="container mx-auto px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 grid gap-8 md:grid-cols-3">
              <div>
                <h3 className="font-display mb-3 text-lg font-semibold">Life is Short</h3>
                <p className="text-sm leading-relaxed text-neutral-600">
                  부모님의 소중한 추억을
                  <br />
                  AI로 되살립니다
                </p>
              </div>
              <div>
                <h4 className="font-display mb-3 text-sm font-semibold">문의</h4>
                <p className="text-sm text-neutral-600">이메일: wondolee28@gmail.com</p>
              </div>
              <div>
                <h4 className="font-display mb-3 text-sm font-semibold">서비스</h4>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li>사진 복원</li>
                  <li>영상 제작</li>
                  <li>카카오톡 전송</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-neutral-200 pt-8 text-center">
              <p className="text-sm text-neutral-500">© 2025 Life is Short. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* 그룹 생성 다이얼로그 */}
      <CreateGroupDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
