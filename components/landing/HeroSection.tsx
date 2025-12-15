'use client';

import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onStartClick: () => void;
}

export default function HeroSection({ onStartClick }: HeroSectionProps) {
  return (
    <section className="container mx-auto px-4 py-12 sm:px-6 md:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid items-center gap-8 md:mb-16 md:grid-cols-2 md:gap-30">
          {/* Left: Visual Placeholder */}
          <div className="order-2 md:order-1">
            <div className="aspect-square overflow-hidden rounded-2xl bg-neutral-100 md:aspect-[4/5]">
              <video
                src="/hero_example_merged.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Right: Text Content */}
          <div className="order-1 space-y-6 md:order-2">
            <h1 className="font-display text-4xl leading-tight font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="animate-fadeInUp animate-delay-1000 block">당신의 손끝에서</span>
              <span className="animate-fadeInUp animate-delay-1500 block">다시 빛나는</span>
              <span className="animate-fadeInUp animate-delay-2000 block">
                부모님의 찬란한 청춘
              </span>
            </h1>
            <p className="animate-fadeInUp animate-delay-2500 text-lg text-pretty text-neutral-600 md:text-2xl">
              우리가 그러하듯, <br></br>부모님들께도 소중한 젊음이 있었습니다. <br></br>
              이제는 사진 속에서 그 젊음을 꺼내어 선물해봅시다.
            </p>
            <Button
              size="lg"
              onClick={onStartClick}
              className="animate-fadeInUp animate-delay-3000 bg-neutral-900 px-10 py-6 text-xl text-white hover:bg-neutral-700"
            >
              바로 제작하기
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
