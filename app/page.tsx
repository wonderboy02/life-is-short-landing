"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Play, ImageIcon, Palette, Video, MessageCircle, ChevronDown, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Marquee from "react-fast-marquee"

export default function Home() {
  const [showUpload, setShowUpload] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<"single" | "story" | "premium">("story")
  const [expandedPlan, setExpandedPlan] = useState<"single" | "story" | "premium" | null>("story")

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      fileArray.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          setUploadedImages((prev) => [...prev, event.target?.result as string])
          setShowForm(true)
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
    if (uploadedImages.length === 1) {
      setShowForm(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phoneNumber && agreedToTerms) {
      setIsSubmitted(true)
    }
  }

  const scrollToDemo = () => {
    setShowUpload(true)
    setTimeout(() => {
      document.getElementById("demo-section")?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-neutral-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-neutral-900"></div>
              <span className="text-lg font-semibold text-neutral-900 font-display">Life Is Short</span>
            </div>
            <div className="text-sm text-neutral-500">Our Team</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero + Demo Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-16">
              {/* Left: Visual Placeholder */}
              <div className="order-2 md:order-1">
                <div className="aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100">
                  <video
                    src="/hero_example_merged.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Right: Text Content */}
              <div className="order-1 md:order-2 space-y-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-balance leading-tight tracking-tight font-display">
                  당신의 손끝에서
                  <br />
                  다시 시작되는
                  <br />
                  부모님의 찬란했던 청춘
                </h1>
                <p className="text-lg md:text-xl text-neutral-600 text-pretty">빛나던 시절을 AI가 돌려드립니다</p>
                {!showUpload ? (
                  <Button
                    size="lg"
                    onClick={scrollToDemo}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white px-10 py-6 text-lg"
                  >
                    바로 제작하기
                  </Button>
                ) : null}
              </div>
            </div>

            <div id="demo-section">
              {showUpload && (
                <div className="mb-12 md:mb-16">
                  <div className="bg-neutral-50 rounded-2xl p-6 sm:p-8 md:p-12 border border-neutral-100">
                    {uploadedImages.length === 0 ? (
                      // Upload State
                      <div className="aspect-[4/3] md:aspect-video flex flex-col items-center justify-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center">
                          <Upload className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg md:text-xl font-semibold mb-2">사진을 업로드하세요</h3>
                          <p className="text-sm text-neutral-500 mb-6">JPG, PNG 형식 지원 (여러 장 가능)</p>
                          <label htmlFor="photo-upload" className="inline-block">
                            <span className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-neutral-900 text-white hover:bg-neutral-800 h-10 px-8 cursor-pointer">
                              사진 넣기
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
                            <div key={index} className="relative aspect-square rounded-xl overflow-visible bg-neutral-200">
                              <img
                                src={image}
                                alt={`Uploaded ${index + 1}`}
                                className="w-full h-full object-cover rounded-xl"
                              />
                              <button
                                onClick={() => handleRemoveImage(index)}
                                className="absolute -top-2 -right-2 w-7 h-7 bg-black hover:bg-neutral-800 text-white rounded-full flex items-center justify-center shadow-lg text-lg font-light border-2 border-white"
                                type="button"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="text-center">
                          <label htmlFor="photo-upload-more" className="inline-block">
                            <span className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-neutral-200 text-neutral-900 hover:bg-neutral-300 h-10 px-6 cursor-pointer">
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
                                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                                  required
                                  className="mt-1"
                                />
                                <Label
                                  htmlFor="terms"
                                  className="text-sm text-neutral-600 leading-relaxed cursor-pointer"
                                >
                                  개인정보 수집 및 이용에 동의합니다. 제공된 정보는 영상 제작 및 전송 목적으로만
                                  사용됩니다.
                                </Label>
                              </div>
                            </div>

                            <Button
                              type="submit"
                              disabled={!phoneNumber || !agreedToTerms}
                              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white h-12 text-base disabled:opacity-50"
                            >
                              제출하기
                            </Button>
                          </form>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-[4/3] md:aspect-video flex flex-col items-center justify-center gap-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                          <MessageCircle className="w-7 h-7 text-green-700" />
                        </div>
                        <div>
                          <h3 className="text-xl md:text-2xl font-semibold mb-3 font-display">제출 완료!</h3>
                          <p className="text-neutral-600 leading-relaxed max-w-md mx-auto">
                            소중한 사진 감사드립니다.
                            <br />곧 연락드리겠습니다.
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
        <section className="py-16 md:py-24 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-100 rounded-full mb-6">
                <span className="text-3xl font-bold text-neutral-900">1,247</span>
                <span className="text-neutral-600">명의 사용자</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">소중한 추억을 되찾은 분들의 이야기</h2>
              <p className="text-lg text-neutral-600">실제 사용자분들의 생생한 후기입니다</p>
            </div>
          </div>

          <Marquee gradient={false} speed={40} className="py-4">
            {/* Review 1 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 w-[280px] mx-3">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-neutral-700 leading-relaxed mb-6">
                어머니가 정말 좋아하셨어요. 영상 보시면서 많이 우셨습니다.
              </p>
              <div className="text-sm text-neutral-600">박*영 (43세, 여)</div>
            </div>

            {/* Review 2 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 w-[280px] mx-3">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-neutral-700 leading-relaxed mb-6">
                아버지 젊으셨을 때 모습을 처음 봤어요. 가족들이 다 감동했습니다.
              </p>
              <div className="text-sm text-neutral-600">김*수 (47세, 남)</div>
            </div>

            {/* Review 3 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 w-[280px] mx-3">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-neutral-700 leading-relaxed mb-6">
                부모님 두 분 다 너무 좋아하셨어요. 감사합니다.
              </p>
              <div className="text-sm text-neutral-600">이*희 (51세, 여)</div>
            </div>

            {/* Review 4 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 w-[280px] mx-3">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-neutral-700 leading-relaxed mb-6">
                흑백 사진이었는데 색이 입혀지니 신기했어요. 어머니가 계속 보고 계세요.
              </p>
              <div className="text-sm text-neutral-600">최*민 (45세, 남)</div>
            </div>

            {/* Review 5 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 w-[280px] mx-3">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-neutral-700 leading-relaxed mb-6">
                아버지 생신 선물로 드렸는데 정말 좋아하셨습니다.
              </p>
              <div className="text-sm text-neutral-600">정*아 (49세, 여)</div>
            </div>

            {/* Review 6 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 w-[280px] mx-3">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-neutral-700 leading-relaxed mb-6">
                결과물이 기대 이상이었어요. 부모님이 매우 만족하셨습니다.
              </p>
              <div className="text-sm text-neutral-600">윤*호 (44세, 남)</div>
            </div>
          </Marquee>
        </section>

        <section className="bg-neutral-50 py-16 md:py-24 border-y border-neutral-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 md:mb-20">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display">정성을 다하는 4단계</h2>
                <p className="text-lg text-neutral-600">우리는 당신의 소중한 추억을 정성스럽게 다룹니다</p>
              </div>

              <div className="space-y-8 md:space-y-12">
                {/* Step 1 */}
                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-neutral-200">
                  <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
                    <div className="relative w-48 md:w-64 mx-auto md:mx-0">
                      <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-md">
                        <img
                          src="/process_1.jpg"
                          alt="사진 촬영"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Step number overlay */}
                      <div className="absolute -top-3 -left-3 w-12 h-12 bg-neutral-900 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                        1
                      </div>
                    </div>
                    <div className="space-y-3 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full">
                        <ImageIcon className="w-4 h-4 text-neutral-700" />
                        <span className="text-sm font-medium">사진 준비</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold font-display">소중한 사진을 받아 검수해요</h3>
                      <p className="text-neutral-600 text-base leading-relaxed">
                        추억이 담긴 옛날 사진들은 찢어지거나, 훼손되거나, 빛바랜 경우가 많아요. 하지만 걱정하지 마세요. 그런 사진들도 휴대폰 카메라로 찍어 보내주시면 저희가 검수를 해드려요.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-neutral-200">
                  <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
                    <div className="space-y-3 text-center md:text-left md:order-1 order-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full">
                        <Palette className="w-4 h-4 text-neutral-700" />
                        <span className="text-sm font-medium">AI 화질 복원</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold font-display">
                        최첨단 AI를 활용해
                        <br />
                        사진을 최상의 품질로 복원해요
                      </h3>
                      <p className="text-neutral-600 text-base leading-relaxed">
                        AI를 이용해 "업스케일링"이라는 과정을 거쳐요. 사진에서 찢어져 사라진 부분, 빛이 바래 흐려진 부분 등을 복원하고, 사진의 화질을 올려요. 추억의 해상도는 생생해야 하는 법이니까요.
                      </p>
                    </div>
                    <div className="relative w-48 md:w-64 mx-auto md:mx-0 md:order-2 order-1 md:ml-auto">
                      <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-md">
                        <img
                          src="/process_2.jpeg"
                          alt="AI 화질 복원"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -top-3 -right-3 w-12 h-12 bg-neutral-900 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                        2
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-neutral-200">
                  <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
                    <div className="relative w-48 md:w-64 mx-auto md:mx-0">
                      <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-md">
                        <video
                          src="/process_3.mp4"
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -top-3 -left-3 w-12 h-12 bg-neutral-900 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                        3
                      </div>
                    </div>
                    <div className="space-y-3 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full">
                        <Video className="w-4 h-4 text-neutral-700" />
                        <span className="text-sm font-medium">영상 제작</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold font-display">
                        복원된 사진을
                        <br /> 
                        첨단 AI 기술을 활용해 영상으로 만들어요</h3>
                      <p className="text-neutral-600 text-base leading-relaxed">
                        Google의 검증된 AI 엔진과, 다수의 작업을 거쳐본 저희의 노하우로 영상화 작업을 진행해요. 결과물이 만족스러울 때까지, 시행착오를 아끼지 않아요.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-neutral-200">
                  <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
                    <div className="space-y-3 text-center md:text-left md:order-1 order-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full">
                        <MessageCircle className="w-4 h-4 text-neutral-700" />
                        <span className="text-sm font-medium">카카오톡 전송</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold font-display">카카오톡으로 영상을 받아보세요</h3>
                      <p className="text-neutral-600 text-base leading-relaxed">
                        하루 정도 소요되니 조금만 기다려주세요. 완성된 영상과 함께 복원된 사진들도 원본 화질로 모두 보내드립니다.
                      </p>
                    </div>
                    <div className="relative w-48 md:w-64 mx-auto md:mx-0 md:order-2 order-1 md:ml-auto">
                      <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-md">
                        <img
                          src="/smartphone-receiving-kakaotalk-message-with-video.jpg"
                          alt="카카오톡 전송"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -top-3 -right-3 w-12 h-12 bg-neutral-900 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                        4
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-gradient-to-b from-white to-neutral-50">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full mb-4">
                <span className="text-sm font-semibold text-red-600">🎉 출시 기념 특가</span>
                <span className="text-xs text-red-500">최대 60% 할인</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 font-display">소중한 추억을 되살려보세요</h2>
            </div>

            <div className="space-y-3">
              {/* 단품 제작 */}
              <div
                className={`bg-white rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedPlan === "single" ? "border-neutral-900 shadow-md" : "border-neutral-200 hover:border-neutral-300"
                }`}
                onClick={() => {
                  setSelectedPlan("single")
                  setExpandedPlan(expandedPlan === "single" ? null : "single")
                }}
              >
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === "single"
                          ? "border-neutral-900 bg-neutral-900"
                          : "border-neutral-300"
                      }`}
                    >
                      {selectedPlan === "single" && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">단품 제작</h3>
                      <p className="text-sm text-neutral-500">원하는 만큼만</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 transition-transform ${
                      expandedPlan === "single" ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {expandedPlan === "single" && (
                  <div className="px-5 pb-5 pt-2 border-t border-neutral-100">
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm text-neutral-400 line-through">3,000원</span>
                        <span className="text-2xl font-bold text-neutral-900">1,500원</span>
                        <span className="text-sm text-neutral-600">/장</span>
                      </div>
                      <span className="inline-block px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded">
                        50% 할인
                      </span>
                    </div>

                    <ul className="space-y-2 mb-4 text-sm text-neutral-600">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>사진 1장당 가격</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>AI 화질 복원 및 컬러 추가</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>고품질 이미지 전송</span>
                      </li>
                    </ul>

                    <Button
                      size="lg"
                      onClick={(e) => {
                        e.stopPropagation()
                        scrollToDemo()
                      }}
                      className="w-full bg-neutral-900 hover:bg-neutral-800 text-white px-10 py-6 text-lg"
                    >
                      바로 제작하기
                    </Button>
                  </div>
                )}
              </div>

              {/* 청춘 스토리 (기본 선택 & 펼쳐짐) */}
              <div
                className={`bg-white rounded-2xl border-2 transition-all cursor-pointer relative overflow-visible ${
                  selectedPlan === "story" ? "border-neutral-900 shadow-lg" : "border-neutral-200 hover:border-neutral-300"
                }`}
                onClick={() => {
                  setSelectedPlan("story")
                  setExpandedPlan(expandedPlan === "story" ? null : "story")
                }}
              >
                {/* 인기 배지 */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    ⭐ 가장 인기
                  </div>
                </div>

                <div className="p-5 flex items-center justify-between pt-7">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === "story"
                          ? "border-neutral-900 bg-neutral-900"
                          : "border-neutral-300"
                      }`}
                    >
                      {selectedPlan === "story" && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">다시 돌아온 청춘 스토리</h3>
                      <p className="text-sm text-neutral-500">가장 많이 선택하는</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 transition-transform ${
                      expandedPlan === "story" ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {expandedPlan === "story" && (
                  <div className="px-5 pb-5 pt-2 border-t border-neutral-100">
                    <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-xl p-4 mb-4">
                      <div className="text-center mb-3">
                        <div className="text-2xl font-bold mb-1">🎬 사진 10장 → 1분 영상</div>
                      </div>
                      <div className="flex items-baseline justify-center gap-2 mb-1">
                        <span className="text-lg text-neutral-400 line-through">30,000원</span>
                        <span className="text-3xl font-bold text-neutral-900">12,900원</span>
                      </div>
                      <div className="text-center">
                        <span className="inline-block px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                          57% 할인
                        </span>
                        <p className="text-xs text-neutral-500 mt-2">장당 1,290원</p>
                      </div>
                    </div>

                    {/* 차별화 포인트 */}
                    <div className="mb-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                      <div className="text-center">
                        <div className="text-lg font-bold text-neutral-900 mb-2">
                          🎬 이제까지 없던 새로운 방식
                        </div>
                        <p className="text-sm text-neutral-700 leading-relaxed">
                          단순한 복원이 아닙니다.<br />
                          인생의 흐름이 하나의 영상이 되어<br />
                          추억이 눈앞에 돌아옵니다.
                        </p>
                      </div>
                    </div>

                    {/* 영상 미리보기 */}
                    <div className="mb-5 rounded-xl overflow-hidden bg-neutral-900">
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

                    <ul className="space-y-2.5 mb-5 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-700">여러 추억을 하나의 감동적인 스토리로</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-700">감성 음악과 함께 1분 영상 제작</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-700">AI 화질 복원 및 자연스러운 컬러 추가</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-700">부모님이 가장 좋아하시는 구성</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-700">카카오톡으로 간편하게 전송</span>
                      </li>
                    </ul>

                    <Button
                      size="lg"
                      onClick={(e) => {
                        e.stopPropagation()
                        scrollToDemo()
                      }}
                      className="w-full bg-neutral-900 hover:bg-neutral-800 text-white px-10 py-6 text-lg"
                    >
                      바로 제작하기
                    </Button>
                  </div>
                )}
              </div>

              {/* 프리미엄 패키지 */}
              <div
                className={`bg-white rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedPlan === "premium" ? "border-neutral-900 shadow-md" : "border-neutral-200 hover:border-neutral-300"
                }`}
                onClick={() => {
                  setSelectedPlan("premium")
                  setExpandedPlan(expandedPlan === "premium" ? null : "premium")
                }}
              >
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === "premium"
                          ? "border-neutral-900 bg-neutral-900"
                          : "border-neutral-300"
                      }`}
                    >
                      {selectedPlan === "premium" && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        프리미엄 패키지
                        <span className="text-base">💎</span>
                      </h3>
                      <p className="text-sm text-neutral-500">가장 큰 감동</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 transition-transform ${
                      expandedPlan === "premium" ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {expandedPlan === "premium" && (
                  <div className="px-5 pb-5 pt-2 border-t border-neutral-100">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 mb-4 border border-purple-100">
                      <div className="text-center mb-3">
                        <div className="text-2xl font-bold mb-1">🎥 사진 20장 → 2분 영상</div>
                      </div>
                      <div className="flex items-baseline justify-center gap-2 mb-1">
                        <span className="text-lg text-neutral-400 line-through">50,000원</span>
                        <span className="text-3xl font-bold text-neutral-900">19,900원</span>
                      </div>
                      <div className="text-center">
                        <span className="inline-block px-3 py-1 bg-purple-600 text-white text-sm font-bold rounded-full">
                          60% 할인
                        </span>
                        <p className="text-xs text-neutral-500 mt-2">장당 995원</p>
                      </div>
                    </div>

                    <ul className="space-y-2.5 mb-5 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-700">더 많은 추억, 더 긴 감동의 2분 영상</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-700">프리미엄 음악과 고급 편집</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-700">AI 화질 복원 및 자연스러운 컬러 추가</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-700">부모님께 가장 큰 감동 선물</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-700">장당 최저가 (995원)</span>
                      </li>
                    </ul>

                    <Button
                      size="lg"
                      onClick={(e) => {
                        e.stopPropagation()
                        scrollToDemo()
                      }}
                      className="w-full bg-neutral-900 hover:bg-neutral-800 text-white px-10 py-6 text-lg"
                    >
                      바로 제작하기
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-center text-xs text-neutral-500 mt-6">
              * 출시 기념 특가는 조기 마감될 수 있습니다
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100 bg-neutral-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-lg mb-3 font-display">Life is Short</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  부모님의 소중한 추억을
                  <br />
                  AI로 되살립니다
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-sm font-display">문의</h4>
                <p className="text-sm text-neutral-600">이메일: wondolee28@gmail.com</p>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-sm font-display">서비스</h4>
                <ul className="text-sm text-neutral-600 space-y-2">
                  <li>사진 복원</li>
                  <li>영상 제작</li>
                  <li>카카오톡 전송</li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-neutral-200 text-center">
              <p className="text-sm text-neutral-500">© 2025 Life is Short. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
