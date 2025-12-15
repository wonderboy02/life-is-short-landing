'use client';

import Marquee from 'react-fast-marquee';

const reviews = [
  {
    id: 1,
    content: '어머니가 정말 좋아하셨어요. 영상 보시면서 많이 우셨습니다.',
    author: '박*영 (43세, 여)',
  },
  {
    id: 2,
    content: '아버지 젊으셨을 때 모습을 처음 봤어요. 가족들이 다 감동했습니다.',
    author: '김*수 (47세, 남)',
  },
  {
    id: 3,
    content: '부모님 두 분 다 너무 좋아하셨어요. 감사합니다.',
    author: '이*희 (51세, 여)',
  },
  {
    id: 4,
    content: '흑백 사진이었는데 색이 입혀지니 신기했어요. 어머니가 계속 보고 계세요.',
    author: '최*민 (45세, 남)',
  },
  {
    id: 5,
    content: '아버지 생신 선물로 드렸는데 정말 좋아하셨습니다.',
    author: '정*아 (49세, 여)',
  },
  {
    id: 6,
    content: '결과물이 기대 이상이었어요. 부모님이 매우 만족하셨습니다.',
    author: '윤*호 (44세, 남)',
  },
];

function StarIcon() {
  return (
    <svg className="h-5 w-5 fill-yellow-400" viewBox="0 0 20 20">
      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
    </svg>
  );
}

function ReviewCard({ content, author }: { content: string; author: string }) {
  return (
    <div className="mx-3 w-[280px] rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-4 flex gap-1">
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} />
        ))}
      </div>
      <p className="mb-6 leading-relaxed text-neutral-700">{content}</p>
      <div className="text-sm text-neutral-600">{author}</div>
    </div>
  );
}

export default function ReviewsSection() {
  return (
    <section className="overflow-hidden bg-neutral-50 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center md:mb-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-neutral-200 px-4 py-2">
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
          {reviews.map((review) => (
            <ReviewCard key={review.id} content={review.content} author={review.author} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
