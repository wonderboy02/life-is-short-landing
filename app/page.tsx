"use client"

import type React from "react"

import { useState } from "react"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { Upload, Play, ImageIcon, Palette, Video, MessageCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function Home() {
  const [showUpload, setShowUpload] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)

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

      {/* Instagram Embed Section */}
      {/* <section className="pt-20 pb-8 flex justify-center">
        <div className="max-w-xl w-full px-4">
          <blockquote
            className="instagram-media"
            data-instgrm-permalink="https://www.instagram.com/reel/DRaiWFvCJx5/?utm_source=ig_embed&utm_campaign=loading"
            data-instgrm-version="14"
            style={{
              background: '#FFF',
              border: 0,
              borderRadius: '3px',
              boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
              margin: '1px',
              maxWidth: '540px',
              minWidth: '326px',
              padding: 0,
              width: 'calc(100% - 2px)',
            }}
          />
        </div>
        <Script
          src="https://www.instagram.com/embed.js"
          strategy="lazyOnload"
        />
      </section> */}

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
                  다시 빛나는
                  <br />
                  부모님의 찬란한 청춘
                </h1>
                <p className="text-lg md:text-xl text-neutral-600 text-pretty">우리가 그러하듯, 부모님들께도 소중한 젊음이 있었습니다. <br></br>
                이제는 사진 속에서 그 젊음을 꺼내어 선물해봅시다.</p>
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
                          <h3 className="text-lg md:text-xl font-semibold mb-2 font-display">소중한 추억을 업로드해주세요</h3>
                          <p className="text-sm text-neutral-500 mb-6">
                            초점이 잘 맞는, 정면에서 찍은 사진이 가장 좋아요.<br></br>JPG, PNG 형식을 지원해요.</p>
                          <label htmlFor="photo-upload" className="inline-block">
                            <span className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-neutral-900 text-white hover:bg-neutral-800 h-10 px-8 cursor-pointer">
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
        <section className="py-16 md:py-24 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-100 rounded-full mb-6">
                <span className="text-3xl font-bold text-neutral-900">1,247</span>
                <span className="text-neutral-600">명의 사용자</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">직접 감동을 선물해본 이들의 경험담</h2>
              <p className="text-lg text-neutral-600">실제 사용자분들이 대가 없이 남겨주신 피드백이에요.</p>
            </div>

          <div className="relative">
            <div className="flex gap-6 animate-scroll-reviews">
              {[...Array(2)].map((_, setIndex) => (
                <div key={setIndex} className="flex gap-6 flex-shrink-0">
                  {/* Review 1 */}
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 w-[350px] flex-shrink-0">
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
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 w-[350px] flex-shrink-0">
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
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 w-[350px] flex-shrink-0">
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

              {/* Review 4 (originally labelled Review 2) */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 w-[350px] flex-shrink-0">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-neutral-700 leading-relaxed mb-6">
                  돌아가신 아버지의 청년 시절 사진을 보내드렸는데, 완성된 영상 보고 온 가족이 함께 울었습니다. 정말 감사드립니다.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-200"></div>
                  <div>
                    <div className="font-semibold text-sm">이준호</div>
                    <div className="text-xs text-neutral-500">부산</div>
                  </div>
                </div>
              </div>

                  {/* Review 5 */}
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 w-[350px] flex-shrink-0">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-yellow-400"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-neutral-700 leading-relaxed mb-6">
                  아버지 생신 선물로 드렸는데 정말 좋아하셨습니다.
                </p>
                <div className="text-sm text-neutral-600">정*아 (49세, 여)</div>
              </div>

              {/* Review 6 (originally labelled Review 3) */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-100 w-[350px] flex-shrink-0">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-neutral-700 leading-relaxed mb-6">
                  흑백 사진이 이렇게 생생하게 복원될 줄 몰랐어요. 부모님 결혼식 사진으로 만든 영상 정말 잘 받았습니다. 강력 추천합니다!
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-200"></div>
                  <div>
                    <div className="font-semibold text-sm">박서연</div>
                    <div className="text-xs text-neutral-500">대구</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 py-16 md:py-24 border-y border-neutral-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 md:mb-20">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 font-display">저희는 이렇게 추억을 되살려 드려요</h2>
                <p className="text-lg text-neutral-600">추억이 온전히 되살아날 수 있도록, <br></br>저희 팀의 기술을 최대한 활용하고 있어요.</p>
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
                        하나
                      </div>
                    </div>
                    <div className="space-y-3 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full">
                        <ImageIcon className="w-4 h-4 text-neutral-700" />
                        <span className="text-sm font-medium">사진 준비</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold font-display">소중한 사진을 받아 검수해요</h3>
                      <p className="text-neutral-600 text-base leading-relaxed">
                        추억이 담긴 옛날 사진들은 찢어지거나, 훼손되거나, 빛바랜 경우가 많아요. 하지만 걱정하지 마세요. 그런 사진들도 휴대폰 카메라로 찍어서 보내주시면 저희가 검수를 도와드려요.
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
                      <h3 className="text-xl md:text-2xl font-bold font-display">AI를 활용해 사진을 최상의 품질로 복원해요</h3>
                      <p className="text-neutral-600 text-base leading-relaxed">
                      추억의 해상도는 생생해야 하는 법이에요. AI를 이용해 "업스케일링"이라는 과정을 거쳐요. 사진에서 찢어져 사라진 부분, 빛이 바래 흐려진 부분 등을 복원하고, 사진의 화질을 올려요. 
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
                        둘
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
                        셋
                      </div>
                    </div>
                    <div className="space-y-3 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full">
                        <Video className="w-4 h-4 text-neutral-700" />
                        <span className="text-sm font-medium">영상 제작</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold font-display">복원된 사진을 가지고 영상화 작업을 거쳐요</h3>
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
                      <h3 className="text-xl md:text-2xl font-bold font-display">영상은 물론, 복원된 사진까지 함께 <br></br>원본 화질로 보내드려요.</h3>
                      <p className="text-neutral-600 text-base leading-relaxed">
                        하루 정도 소요되니 조금만 기다려주세요.<br></br> 완성된 영상을 카카오톡으로 받아보실 수 있습니다.
                      </p>
                    </div>
                    <div className="relative w-48 md:w-64 mx-auto md:mx-0 md:order-2 order-1 md:ml-auto">
                      <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-md">
                        <img
                          src="/kakao.png"
                          alt="카카오톡 전송"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -top-3 -right-3 w-12 h-12 bg-neutral-900 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                        넷
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-balance font-display">소중한 추억을 되살려보세요</h2>
            <Button
              size="lg"
              onClick={scrollToDemo}
              className="bg-neutral-900 hover:bg-neutral-800 text-white px-12 py-6 text-lg"
            >
              바로 제작하기
            </Button>
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
