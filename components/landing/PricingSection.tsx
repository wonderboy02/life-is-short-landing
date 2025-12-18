'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check } from 'lucide-react';
import HydrationLogger from './HydrationLogger';

interface PricingSectionProps {
  isBetaTest: boolean;
  onCtaClick: () => void;
}

export default function PricingSection({ isBetaTest, onCtaClick }: PricingSectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<'single' | 'story' | 'premium'>('story');
  const [expandedPlan, setExpandedPlan] = useState<'single' | 'story' | 'premium' | null>('story');

  if (isBetaTest) {
    return (
      <section className="container mx-auto px-4 py-20 sm:px-6 md:py-32 lg:px-8">
        <HydrationLogger componentName="PricingSection (Beta)" />
        <div className="mx-auto max-w-2xl">
          {/* 얼리버드 배지 */}
          <div className="mb-10 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-5 py-2.5">
              <span className="text-xl">✨</span>
              <span className="text-sm font-semibold text-neutral-700">서비스 사전 운영 중</span>
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
            부모님의 청춘을 온전히 선물할 수 있는 유일한 서비스.
            <br className="md:hidden" /> 지금 누구보다 먼저, 부모님께 감동을 선물하세요.
          </p>

          {/* 가격 카드 */}
          <div className="mb-5 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-10">
            {/* 가격 비교 */}
            <div className="mb-2">
              <div className="mb-5 flex items-center justify-center gap-3">
                <div className="text-center">
                  <p className="mb-1 text-xs font-medium text-neutral-500">서비스 정가</p>
                  <p className="text-2xl font-bold text-neutral-400 line-through md:text-3xl">
                    45,000원
                  </p>
                </div>
                <div className="mt-3 ml-1 text-4xl font-bold text-neutral-300 md:text-5xl">→</div>
                <div className="text-center">
                  <p className="mb-1 text-xs font-medium text-neutral-500">사전 운영 기간 한정</p>
                  <p className="text-5xl font-bold text-neutral-700 md:text-6xl">0원</p>
                </div>
              </div>

              <div className="rounded-xl bg-neutral-100 p-5">
                <p className="text-md mb-3 text-center font-semibold text-neutral-700">
                  포함된 서비스
                </p>
                <ul className="space-y-2.5 text-sm text-neutral-600">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-neutral-900">•</span>
                    <span>영상 수령 전에도, 후에도, 완전한 무료 서비스</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-neutral-900">•</span>
                    <span>결제 정보 입력 없이, 바로 서비스 진행</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-neutral-900">•</span>
                    <span>AI 화질 복원 & 영상화</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-neutral-900">•</span>
                    <span>감성 영상 제작 및 카카오톡 전송</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA 버튼 */}
          <div className="space-y-4">
            <Button
              size="lg"
              onClick={onCtaClick}
              className="font-regular h-14 w-full rounded-xl bg-neutral-900 text-xl text-white transition-all hover:bg-neutral-800 md:h-16 md:text-xl"
            >
              지금 무료로 만들어보기
            </Button>

            <p className="text-center text-sm text-neutral-500">
              사전 운영 기간 종류 후 즉시 유료로 전환됩니다
            </p>
          </div>
        </div>
      </section>
    );
  }

  // 정식 가격 섹션
  return (
    <section className="container mx-auto bg-gradient-to-b from-white to-neutral-50 px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <HydrationLogger componentName="PricingSection (정식)" />
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
                    onCtaClick();
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
                    <span className="text-neutral-700">여러 추억을 하나의 감동적인 스토리로</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span className="text-neutral-700">감성 음악과 함께 1분 영상 제작</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span className="text-neutral-700">AI 화질 복원 및 자연스러운 컬러 추가</span>
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
                    onCtaClick();
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
                  <h3 className="flex items-center gap-2 text-lg font-semibold">프리미엄 패키지</h3>
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
                    <span className="text-neutral-700">더 많은 추억, 더 긴 감동의 2분 영상</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span className="text-neutral-700">프리미엄 음악과 고급 편집</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span className="text-neutral-700">AI 화질 복원 및 자연스러운 컬러 추가</span>
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
                    onCtaClick();
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
  );
}
