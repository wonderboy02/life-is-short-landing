import { ImageIcon, Palette, Video, MessageCircle } from 'lucide-react';

export default function ProcessSection() {
  return (
    <section className="border-y border-neutral-100 bg-white py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-left md:mb-20">
            <h2 className="font-display mb-4 text-3xl font-bold md:text-5xl">
              그저 사진들을 폰으로 찍어<br className="inline md:hidden"></br> 올려주시만 하면
              끝이에요
            </h2>
            <p className="text-lg text-neutral-600">
              나머지는 전부 저희가 맡아 세상에 단 하나뿐인 선물로 만들어드려요.
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
                  <div className="absolute -top-3 -left-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-xl font-bold text-white shadow-lg">
                    1
                  </div>
                </div>
                <div className="space-y-3 text-center md:text-left">
                  <h3 className="font-display text-xl font-bold md:text-4xl">
                    영상으로 바뀔 사진들이 한 곳에 모여요
                  </h3>
                  <p className="text-base leading-relaxed text-neutral-600 md:text-xl">
                    추억이 담긴 사진들은 훼손되거나, 빛바랜 경우가 많아요. 하지만 걱정하지 마세요.
                    그런 사진들도 휴대폰 카메라로 찍어서 보내주시면 저희가 검수를 도와드려요. 더
                    이상 고객님께서 신경쓰셔야 할 부분은 없답니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6 shadow-sm md:p-20">
              <div className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
                <div className="order-2 space-y-3 text-center md:order-1 md:text-left">
                  <h3 className="font-display text-xl font-bold md:text-4xl">
                    최신 AI를 활용해
                    <br />
                    사진을 최상의 품질로 복원해요
                  </h3>
                  <p className="text-base leading-relaxed text-neutral-600 md:text-xl">
                    추억의 해상도는 생생해야 하는 법이에요. Google의 Nano banana Pro AI를 이용해
                    "업스케일링"이라는 과정을 거쳐요. 찢어져 사라진 부분, 흐려진 부분 등을 복원하고,
                    사진의 화질을 끌어올려요.
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
                  <div className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-xl font-bold text-white shadow-lg">
                    2
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
                  <div className="absolute -top-3 -left-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-xl font-bold text-white shadow-lg">
                    3
                  </div>
                </div>
                <div className="space-y-3 text-center md:text-left">
                  <h3 className="font-display text-xl font-bold md:text-4xl">
                    복원된 사진들을 모두 모아
                    <br />
                    살아 숨쉬는 영상을 빚어내요
                  </h3>
                  <p className="text-base leading-relaxed text-neutral-600 md:text-xl">
                    Google의 최고 성능 영상 AI 엔진과, 경험 많은 저희의 노하우로 영상화 작업을
                    진행해요. 결과물이 만족스러울 때까지, 시행착오를 아끼지 않아요.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-20">
              <div className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
                <div className="order-2 space-y-3 text-center md:order-1 md:text-left">
                  <h3 className="font-display text-xl font-bold md:text-4xl">
                    영상은 물론, 복원된 사진까지 <br></br>원본 화질로 함께 보내드려요
                  </h3>
                  <p className="text-base leading-relaxed text-neutral-600 md:text-xl">
                    작업은 하루 정도 소요돼요. 조금만 기다려주시면, 완성된 영상과 복원된 사진들을
                    함께 원본 화질로 보내드릴게요.
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
                  <div className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-xl font-bold text-white shadow-lg">
                    4
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
