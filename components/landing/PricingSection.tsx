'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check } from 'lucide-react';

interface PricingSectionProps {
  onActionClick: () => void;
}

type PlanType = 'single' | 'story' | 'premium';

export default function PricingSection({ onActionClick }: PricingSectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('story');
  const [expandedPlan, setExpandedPlan] = useState<PlanType | null>('story');

  const singleRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const premiumRef = useRef<HTMLDivElement>(null);

  const handlePlanClick = (plan: PlanType) => {
    const wasExpanded = expandedPlan === plan;
    setSelectedPlan(plan);
    setExpandedPlan(wasExpanded ? null : plan);

    // 카드가 펼쳐질 때만 스크롤 (접힐 때는 스크롤하지 않음)
    if (!wasExpanded) {
      // 약간의 지연을 주어 DOM이 업데이트된 후 스크롤
      setTimeout(() => {
        const refs = { single: singleRef, story: storyRef, premium: premiumRef };
        const ref = refs[plan];

        if (ref.current) {
          const navbarHeight = 64; // 네비바 높이 (h-16 = 64px)
          const additionalPadding = 20; // 추가 상단 여백
          const yOffset = -(navbarHeight + additionalPadding); // 네비바 + 여백 고려
          const element = ref.current;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <section className="bg-gradient-to-b from-neutral-50 to-neutral-100 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
              ref={singleRef}
              className={`cursor-pointer rounded-2xl border-2 bg-white transition-all ${
                selectedPlan === 'single'
                  ? 'border-neutral-900 shadow-md'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
              onClick={() => handlePlanClick('single')}
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
                      onActionClick();
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
              ref={storyRef}
              className={`relative cursor-pointer overflow-visible rounded-2xl border-2 bg-white transition-all ${
                selectedPlan === 'story'
                  ? 'border-neutral-900 shadow-lg'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
              onClick={() => handlePlanClick('story')}
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
                      onActionClick();
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
              ref={premiumRef}
              className={`cursor-pointer rounded-2xl border-2 bg-white transition-all ${
                selectedPlan === 'premium'
                  ? 'border-neutral-900 shadow-md'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
              onClick={() => handlePlanClick('premium')}
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
                      onActionClick();
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
      </div>
    </section>
  );
}
