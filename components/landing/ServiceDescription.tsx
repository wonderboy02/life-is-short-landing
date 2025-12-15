'use client';

export default function ServiceDescription() {
  return (
    <section className="bg-neutral-100 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display mb-8 text-center text-3xl font-bold text-neutral-900 md:mb-12 md:text-4xl">
            저희의 서비스는,
          </h2>
          <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-lg md:p-12">
            <div className="space-y-6">
              <p className="text-lg leading-relaxed text-neutral-800 md:text-2xl md:leading-relaxed">
                빛나는 청춘을 살아내신
                <br />
                부모님들의 옛 사진들을 <span> </span>
                <br className="hidden md:block" />
                최신 AI 기술을 통해
                <br />
                <span className="font-semibold text-neutral-900"> 움직이는 영상</span>으로
                제작해드리는 서비스입니다.
              </p>
              <p className="text-lg leading-relaxed text-neutral-600 md:text-2xl md:leading-relaxed">
                기술의 한계로 인해
                <br />
                <span className="font-semibold text-neutral-900">
                  사진으로만 추억을 남길 수 있던
                </span>{' '}
                부모님들께,
                <br />
                <br className="hidden md:block" />
                아름다웠던 삶의 궤적에 생동감을 더해 선물해보세요.
              </p>
              <p className="text-lg leading-relaxed text-neutral-600 md:text-2xl md:leading-relaxed">
                뜻깊은 부모님의 <span className="font-semibold text-neutral-900">생신</span>에,{' '}
                <br></br>
                특별한{' '}
                <span className="font-semibold text-neutral-900">
                  환갑, 칠순, 팔순 잔치
                </span>에, <br></br>
                부모님 두 분의{' '}
                <span className="font-semibold text-neutral-900">결혼기념일</span>에, <br></br>
                가족 모두 모인 <span> </span>
                <span className="font-semibold text-neutral-900">
                  어버이날과 추석, 신년
                </span>에 <br></br>그 어느 순간이라도 감동을 선물해보세요
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
