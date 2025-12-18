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
                한 번 상상해보세요. 사진 속으로만 남은 자신의 청춘이, 영상으로 나타나 움직인다면
                어떨까요?
              </p>
              <p className="text-lg leading-relaxed text-neutral-800 md:text-2xl md:leading-relaxed">
                빛나는 청춘을 살아내신 부모님들의 옛 사진들을, <span> </span>
                <br className="hidden md:block" />
                <span className="font-semibold text-neutral-900"> 움직이는 영상</span>으로 변환하여
                부모님을 위한 최고의 선물로 빚어드리는 서비스입니다.
              </p>
              <p className="text-lg leading-relaxed text-neutral-600 md:text-2xl md:leading-relaxed">
                기술의 한계로 인해{' '}
                <span className="font-semibold text-neutral-900">
                  사진으로만 추억을 남길 수 있던
                </span>{' '}
                부모님들께,
                <br className="hidden md:block" />
                누구도 선물한 적 없는 부모님의 젊은 시절을, 직접 선물해보세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
