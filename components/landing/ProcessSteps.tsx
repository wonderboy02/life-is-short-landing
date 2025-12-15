'use client';

import { ImageIcon, Palette, Video, MessageCircle } from 'lucide-react';

export default function ProcessSteps() {
  return (
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
                  <p className="text-base text-lg leading-relaxed text-neutral-600 md:text-xl">
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
                  <p className="text-base text-lg leading-relaxed text-neutral-600 md:text-xl">
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
  );
}
