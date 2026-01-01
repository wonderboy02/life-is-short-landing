'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import HeroSection from '@/components/landing/HeroSection';
import ServiceDescription from '@/components/landing/ServiceDescription';
import ProcessSection from '@/components/landing/ProcessSection';
import BrandStory from '@/components/landing/BrandStory';
import PricingWithDialog from '@/components/landing/PricingWithDialog';
import PageLoadLogger from '@/components/landing/PageLoadLogger';
import FamilyCollaborationSection from '@/components/landing/FamilyCollaborationSection';
import FixedBottomBar from '@/components/FixedBottomBar';

// Heavy components - lazy load
const ReviewsSection = dynamic(() => import('@/components/landing/ReviewsSection'), {
  loading: () => <div className="py-16 md:py-24" />, // Placeholder to prevent layout shift
});

export default function Home() {
  const isBetaTest = process.env.NEXT_PUBLIC_IS_BETA_TEST === 'true';
  const [showBottomBar, setShowBottomBar] = useState(false);

  const handleShowCTA = (show: boolean) => {
    setShowBottomBar(show);
  };

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <PageLoadLogger />
      <Header />

      <main className="pt-16">
        {/* Hero Section - Interactive */}
        <HeroSection onShowCTA={handleShowCTA} />

        {/* Service Description - Static */}
        <ServiceDescription />

        {/* Reviews Section - Heavy (Marquee library), lazy loaded */}
        {!isBetaTest && <ReviewsSection />}

        {/* Family Collaboration Section - Static */}
        <FamilyCollaborationSection />

        {/* Process Section - Static */}
        <ProcessSection />

        {/* Pricing Section - Interactive + Dialog */}
        <PricingWithDialog isBetaTest={isBetaTest} />

        {/* Brand Story - Static */}
        <BrandStory />
      </main>

      <Footer />

      {/* Fixed Bottom Bar - Only show when CTA is visible */}
      {showBottomBar && (
        <FixedBottomBar
          primaryButton={{
            text: "지금 바로 신청하기",
            onClick: scrollToPricing,
          }}
        />
      )}
    </div>
  );
}
