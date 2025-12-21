export default function FamilyCollaborationSection() {
  return (
    <section className="bg-neutral-50 py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 text-center">
              <h2 className="font-display mb-2 text-2xl font-bold text-neutral-900">
                옛날 사진을 몇장 안가지고 계시다고요?
              </h2>
              <p className="text-base text-neutral-600">
                링크 하나로 가족 모두가 함께 사진을 모을 수 있어요
              </p>
            </div>

            {/* Image Placeholder */}
            <div className="mx-auto mb-6">
              <img
                src="/family-collaboration-placeholder.jpg"
                alt="가족 협업 예시"
                className="w-full border border-neutral-200 object-contain"
                style={{ borderRadius: '15px' }}
              />
            </div>

            {/* Compact Steps */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">
                  1
                </div>
                <p className="text-sm text-neutral-700">
                  <span className="font-semibold text-neutral-900">링크 공유</span> - 가족들에게
                  카톡으로 전송
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">
                  2
                </div>
                <p className="text-sm text-neutral-700">
                  <span className="font-semibold text-neutral-900">함께 업로드</span> - 각자 갖고
                  있는 사진을 자유롭게
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">
                  3
                </div>
                <p className="text-sm text-neutral-700">
                  <span className="font-semibold text-neutral-900">하나의 영상으로</span> - 모든
                  추억을 담아 완성
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
