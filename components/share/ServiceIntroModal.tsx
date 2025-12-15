'use client';

import { Button } from '@/components/ui/button';
import { Upload, Palette, Video, ChevronDown } from 'lucide-react';

interface ServiceIntroProps {
  onScrollToMain: () => void;
}

export default function ServiceIntro({ onScrollToMain }: ServiceIntroProps) {
  return (
    <section className="min-h-[100dvh] flex flex-col bg-neutral-900 relative">
      {/* 영상 배경 */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          src="/hero_example_merged.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/60 via-neutral-900/80 to-neutral-900" />
      </div>

      {/* 내용 */}
      <div className="relative flex-1 flex flex-col justify-center py-8 px-4">
        <div className="max-w-lg mx-auto w-full space-y-10">
          {/* 메인 메시지 */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-white leading-tight">
              옛 사진으로
              <br />
              감동적인 영상을 만들어요
            </h1>
            <p className="text-base text-neutral-300 leading-relaxed">
              가족이나 친구들이 모은 옛 사진으로
              <br />
              특별한 추억 영상을 제작합니다
            </p>
          </div>

          {/* 프로세스 설명 */}
          <div className="space-y-5">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-white">
                  1. 사진 모으기
                </h3>
                <p className="text-neutral-300 text-sm leading-relaxed">
                  가족, 친구들과 함께 옛 사진을 모아요
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-white">
                  2. AI 복원
                </h3>
                <p className="text-neutral-300 text-sm leading-relaxed">
                  흑백 사진을 컬러로, 흐린 사진을 선명하게 복원해요
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-white">
                  3. 영상 제작
                </h3>
                <p className="text-neutral-300 text-sm leading-relaxed">
                  음악과 함께 감동적인 추억 영상으로 완성돼요
                </p>
              </div>
            </div>
          </div>

          {/* CTA 버튼 */}
          <div className="pt-2">
            <Button
              onClick={onScrollToMain}
              className="w-full bg-white hover:bg-neutral-100 text-neutral-900 h-14 text-base font-semibold rounded-xl"
            >
              시작하기
            </Button>
          </div>

          {/* 스크롤 힌트 - 버튼 바로 아래 */}
          <div className="flex justify-center pt-4">
            <button
              onClick={onScrollToMain}
              className="text-white/60 hover:text-white/90 transition-colors flex flex-col items-center gap-1"
              aria-label="아래로 스크롤"
            >
              <span className="text-xs">아래로</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
