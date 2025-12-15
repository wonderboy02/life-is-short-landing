'use client';

import type React from 'react';

import { useState } from 'react';
import Script from 'next/script';
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

export default function Home() {
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'single' | 'story' | 'premium'>('story');
  const [expandedPlan, setExpandedPlan] = useState<'single' | 'story' | 'premium' | null>('story');
  ('use client');

  import type React from 'react';

  import { useState } from 'react';
  import Script from 'next/script';
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
    const [expandedPlan, setExpandedPlan] = useState<'single' | 'story' | 'premium' | null>(
      'story'
    );

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
      setShowUpload(true);
      setTimeout(() => {
        document
          .getElementById('demo-section')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    };

    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="fixed top-0 right-0 left-0 z-50 border-b border-neutral-100 bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/favicon/favicon_v4.svg" alt="Life Is Short Logo" className="h-8 w-8" />
                <span className="font-display text-lg font-semibold text-neutral-900">
                  Life Is Short
                </span>
              </div>
              <div className="text-sm text-neutral-500">Our Team</div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-16">
          {/* Hero + Demo Section */}
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
                    <span className="animate-fadeInUp animate-delay-1500 block">
                      당신의 손끝에서
                    </span>
                    <span className="animate-fadeInUp animate-delay-2000 block">다시 빛나는</span>
                    <span className="animate-fadeInUp animate-delay-2500 block">
                      부모님의 찬란한 청춘
                    </span>
                  </h1>
                  <p className="animate-fadeInUp animate-delay-3000 text-lg text-pretty text-neutral-600 md:text-2xl">
                    우리가 그러하듯, <br></br>부모님들께도 소중한 젊음이 있었습니다. <br></br>
                    이제는 사진 속에서 그 젊음을 꺼내어 선물해봅시다.
                  </p>
                  {!showUpload ? (
                    <Button
                      size="lg"
                      onClick={scrollToDemo}
                      className="animate-fadeInUp animate-delay-3500 bg-neutral-900 px-10 py-6 text-xl text-white hover:bg-neutral-700"
                    >
                      바로 제작하기
                    </Button>
                  ) : null}
                </div>
              </div>

              <div id="demo-section">
                {showUpload && (
                  <div className="mb-12 md:mb-16">
                    <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-6 sm:p-8 md:p-12">
                      {uploadedImages.length === 0 ? (
                        // Upload State
                        <div className="flex aspect-[4/3] flex-col items-center justify-center gap-6 md:aspect-video">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900">
                            <Upload className="h-7 w-7 text-white" />
                          </div>
                          <div className="text-center">
                            <h3 className="font-display mb-2 text-lg font-semibold md:text-4xl">
                              소중한 추억을 업로드해주세요
                            </h3>
                            <p className="mb-6 text-sm text-neutral-500 md:text-lg">
                              초점이 잘 맞는, 정면에서 찍은 사진이 가장 좋아요.
                              <br></br>JPG, PNG 형식을 지원해요.
                            </p>
                            <label htmlFor="photo-upload" className="inline-block">
                              <span className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-neutral-900 px-8 text-sm font-medium text-white ring-offset-white transition-colors hover:bg-neutral-700 focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">
                                사진 전달하기
                              </span>
                            </label>
                            <input
                              id="photo-upload"
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </div>
                        </div>
                      ) : !isSubmitted ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-3 gap-4">
                            {uploadedImages.map((image, index) => (
                              <div
                                key={index}
                                className="relative aspect-square overflow-visible rounded-xl bg-neutral-200"
                              >
                                <img
                                  src={image}
                                  alt={`Uploaded ${index + 1}`}
                                  className="h-full w-full rounded-xl object-cover"
                                />
                                <button
                                  onClick={() => handleRemoveImage(index)}
                                  className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-black text-lg font-light text-white shadow-lg hover:bg-neutral-800"
                                  type="button"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="text-center">
                            <label htmlFor="photo-upload-more" className="inline-block">
                              <span className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-neutral-200 px-6 text-sm font-medium text-neutral-900 ring-offset-white transition-colors hover:bg-neutral-300 focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">
                                + 사진 추가
                              </span>
                            </label>
                            <input
                              id="photo-upload-more"
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </div>

                          {showForm && (
                            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="phone" className="text-base">
                                    전화번호
                                  </Label>
                                  <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="010-0000-0000"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                    className="h-12 text-base"
                                  />
                                </div>

                                <div className="flex items-start gap-3 pt-2">
                                  <Checkbox
                                    id="terms"
                                    checked={agreedToTerms}
                                    onCheckedChange={(checked) =>
                                      setAgreedToTerms(checked as boolean)
                                    }
                                    required
                                    className="mt-1"
                                  />
                                  <Label
                                    htmlFor="terms"
                                    className="cursor-pointer text-sm leading-relaxed text-neutral-600"
                                  >
                                    개인정보 수집 및 이용에 동의합니다. 제공된 정보는 영상 제작 및
                                    전송 목적으로만 사용됩니다.
                                  </Label>
                                </div>
                              </div>

                              <Button
                                type="submit"
                                disabled={!phoneNumber || !agreedToTerms}
                                className="h-12 w-full bg-neutral-900 text-base text-white hover:bg-neutral-800 disabled:opacity-50"
                              >
                                제출하기
                              </Button>
                            </form>
                          )}
                        </div>
                      ) : (
                        <div className="flex aspect-[4/3] flex-col items-center justify-center gap-6 text-center md:aspect-video">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <MessageCircle className="h-7 w-7 text-green-700" />
                          </div>
                          <div>
                            <h3 className="font-display mb-3 text-xl font-semibold md:text-2xl">
                              제출 완료!
                            </h3>
                            <p className="mx-auto max-w-md leading-relaxed text-neutral-600">
                              보내주신 소중한 추억, 저희 팀도 조심스럽게 다룰게요.
                              <br />곧 카카오톡을 통해 연락드리겠습니다!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Reviews Section */}
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

          <section className="border-y border-neutral-100 bg-neutral-50 py-16 md:py-24">
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
                        <div className="aspect-[2/3] overflow-hidden rounded-xl shadow-md">
                          <img
                            src="/process_1.jpg"
                            alt="사진 촬영"
                            className="h-full w-full object-cover"
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
                        <div className="aspect-[2/3] overflow-hidden rounded-xl shadow-md">
                          <img
                            src="/process_2.jpeg"
                            alt="AI 화질 복원"
                            className="h-full w-full object-cover"
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
                        <div className="aspect-[2/3] overflow-hidden rounded-xl shadow-md">
                          <img
                            src="/kakao.png"
                            alt="카카오톡 전송"
                            className="h-full w-full object-cover"
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

          {/* Pricing Section */}
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
                          <span>사진 1장당 가격</span>
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
                <p className="text-sm text-neutral-500">
                  © 2025 Life is Short. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>

        {/* 그룹 생성 다이얼로그 */}
        <CreateGroupDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    );
  }
}
