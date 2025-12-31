import { ArrowDown } from 'lucide-react';

export default function ProcessSection() {
  return (
    <section className="border-y border-neutral-100 bg-white py-16 md:py-24">
      <div className="px-4">
        <div className="mx-auto">
          <div className="mb-12 text-left">
            <h2 className="font-display mb-4 text-3xl font-bold">
              사진들을 폰으로 찍어 올려주시기만 하면 끝이에요
            </h2>
            <p className="text-lg text-neutral-600">
              나머지는 전부 저희가 맡아 세상에 단 하나뿐인 선물로 만들어드려요.
            </p>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="grid grid-cols-[auto_1fr] items-center gap-4">
                <div className="relative w-34">
                  <div className="aspect-[3/4] overflow-hidden rounded-xl shadow-md">
                    <img
                      src="/process_1.jpg"
                      alt="사진 촬영"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {/* Step number overlay */}
                  <div className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-lg font-bold text-white shadow-lg">
                    1
                  </div>
                </div>
                <div className="space-y-2 text-left">
                  <h3 className="font-display text-xl font-bold">사진을 찍어 업로드해주세요</h3>
                  <p className="text-sm leading-5 break-keep text-neutral-600">
                    훼손된 사진, 빛바랜 사진도 문제 없어요. 휴대폰 카메라로 찍어서 보내주시기만 하면
                    돼요.
                  </p>
                  <p className="pt-2 text-sm leading-5 break-keep text-neutral-600">
                    <span className="font-semibold text-neutral-900">사진이 없으신가요?</span>{' '}
                    링크를 가족들과 공유해서 함께 사진을 모아보세요.
                  </p>
                </div>
              </div>
            </div>

            {/* Divider with text */}
            <div className="flex items-center gap-4 py-4">
              <div className="flex-1 border-t-2 border-neutral-300"></div>
              <span className="text-sm font-medium whitespace-nowrap text-neutral-600">
                이제부터는 저희 팀에게 맡겨주세요
              </span>
              <div className="flex-1 border-t-2 border-neutral-300"></div>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="grid grid-cols-[auto_1fr] items-center gap-4">
                <div className="relative w-34">
                  <div className="aspect-[3/4] overflow-hidden rounded-xl shadow-md">
                    <img
                      src="/process_2.jpeg"
                      alt="AI 화질 복원"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-lg font-bold text-white shadow-lg">
                    2
                  </div>
                </div>
                <div className="space-y-2 text-left">
                  <h3 className="font-display text-xl font-bold">
                    최신 AI를 활용해 <br /> 사진의 품질을 복원해요
                  </h3>
                  <p className="text-sm leading-5 break-keep text-neutral-600">
                    추억의 해상도는 생생해야 하는 법이에요. AI를 통해 찢어진 부분, 흐려진 부분 등을
                    복원하고, 사진의 화질을 끌어올려요.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="grid grid-cols-[auto_1fr] items-center gap-4">
                <div className="relative w-34">
                  <div className="aspect-[3/4] overflow-hidden rounded-xl shadow-md">
                    <video
                      src="/process_3.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-lg font-bold text-white shadow-lg">
                    3
                  </div>
                </div>
                <div className="space-y-2 text-left">
                  <h3 className="font-display text-xl font-bold">
                    복원된 사진들로 정성껏 영상을 빚어내요
                  </h3>
                  <p className="text-sm leading-5 text-neutral-600">
                    Google의 Veo3 등 최신 AI를 모두 동시에 적용하여 아름다운 순간을 재현해요.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="grid grid-cols-[auto_1fr] items-center gap-4">
                <div className="relative w-34">
                  <div className="aspect-[3/4] overflow-hidden rounded-xl shadow-md">
                    <img
                      src="/kakao.png"
                      alt="카카오톡 전송"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-lg font-bold text-white shadow-lg">
                    4
                  </div>
                </div>
                <div className="space-y-2 text-left">
                  <h3 className="font-display text-xl font-bold">
                    영상과 복원된 사진 모두 원본 화질로 보내드려요
                  </h3>
                  <p className="text-sm leading-5 text-neutral-600">
                    작업은 2~3일 정도 소요돼요. 완성된 영상과 복원된 사진들을 함께 원본 화질로
                    보내드릴게요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
