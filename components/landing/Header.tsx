'use client';

export default function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-neutral-100 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          <div className="flex items-center gap-3">
            <img src="/favicon/logo.png" alt="Life Is Short Logo" className="h-10 w-10" />
            <span className="font-display text-lg font-semibold text-neutral-900">
              Life Is Short
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
