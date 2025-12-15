'use client';

import { useState } from 'react';
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import ServiceDescription from '@/components/landing/ServiceDescription';
import ReviewsSection from '@/components/landing/ReviewsSection';
import ProcessSteps from '@/components/landing/ProcessSteps';
import PricingSection from '@/components/landing/PricingSection';
import BrandStory from '@/components/landing/BrandStory';
import Footer from '@/components/landing/Footer';
import CreateGroupDialog from '@/components/landing/CreateGroupDialog';

export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const openDialog = () => setDialogOpen(true);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16">
        <HeroSection onStartClick={openDialog} />
        <ServiceDescription />
        <ReviewsSection />
        <ProcessSteps />
        <PricingSection onActionClick={openDialog} />
        <BrandStory />
      </main>
      <Footer />
      <CreateGroupDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
