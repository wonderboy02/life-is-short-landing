export default function Footer() {
  return (
    <footer className="border-t border-neutral-100 bg-neutral-50">
      <div className="container mx-auto px-4 py-6 sm:px-6 md:py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 grid grid-cols-2 gap-8">
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
          </div>
          <div className="border-t border-neutral-200 pt-5 text-center">
            <p className="text-sm text-neutral-500">© 2025 Life is Short. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
