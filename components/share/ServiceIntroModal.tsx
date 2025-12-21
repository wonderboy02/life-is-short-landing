'use client';

import { Button } from '@/components/ui/button';
import { Upload, Palette, Video, ChevronDown } from 'lucide-react';
import { formatNameWithParticle } from '@/lib/utils';

interface ServiceIntroProps {
  onScrollToMain: () => void;
  creatorNickname: string;
  comment: string;
}

export default function ServiceIntro({
  onScrollToMain,
  creatorNickname,
  comment,
}: ServiceIntroProps) {
  return (
    <section className="relative flex min-h-[100dvh] flex-col bg-neutral-900">
      {/* 영상 배경 */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          src="/hero_example_merged.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/60 via-neutral-900/80 to-neutral-900" />
      </div>

      {/* 내용 */}
      <div className="relative flex flex-1 flex-col justify-center px-4 py-8">
        <div className="mx-auto w-full max-w-lg space-y-10">
          {/* 메인 메시지 */}
          <div className="space-y-4 text-center">
            <h1 className="font-display text-3xl leading-tight font-bold text-white sm:text-4xl">
              잠자던 사진들이
              <br />
              추억을 되살리는 영상이 돼요
            </h1>
            <p className="text-base leading-relaxed text-neutral-300">
              더 생생한 추억을 위해서
              <br />내 갤러리에 있는 사진도 업로드해 주세요!
            </p>
          </div>

          {/* Quote 섹션 */}
          <div className="rounded-2xl border border-white/20 bg-white/5 px-6 py-5 backdrop-blur-sm">
            <div className="space-y-2">
              <p className="text-base leading-relaxed text-white/90 italic">"{comment}"</p>
              <p className="text-xs text-white/60">- {creatorNickname}</p>
            </div>
          </div>

          {/* 프로세스 설명 */}
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="mb-1 text-base font-semibold text-white">1. 사진 모으기</h3>
                <p className="text-xs leading-relaxed text-neutral-300">
                  가족, 친구들과 함께 옛 사진을 모아요
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="mb-1 text-base font-semibold text-white">2. AI 복원</h3>
                <p className="text-xs leading-relaxed text-neutral-300">
                  흑백 사진을 컬러로, 흐린 사진을 선명하게 복원해요
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="mb-1 text-base font-semibold text-white">3. 영상 제작</h3>
                <p className="text-xs leading-relaxed text-neutral-300">
                  음악과 함께 감동적인 추억 영상으로 완성돼요
                </p>
              </div>
            </div>
          </div>

          {/* CTA 버튼 */}
          <div className="pt-2">
            <Button
              onClick={onScrollToMain}
              className="h-14 w-full rounded-xl bg-white text-base font-semibold text-neutral-900 hover:bg-neutral-100"
            >
              {formatNameWithParticle(creatorNickname)} 함께 사진 모으기
            </Button>
          </div>

          {/* 스크롤 힌트 - 버튼 바로 아래 */}
          <div className="flex justify-center pt-4">
            <button
              onClick={onScrollToMain}
              className="flex flex-col items-center gap-1 text-white/60 transition-colors hover:text-white/90"
              aria-label="아래로 스크롤"
            >
              <span className="text-xs">아래로</span>
              <ChevronDown className="h-5 w-5 animate-bounce" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
