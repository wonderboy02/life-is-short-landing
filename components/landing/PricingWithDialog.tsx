'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import PricingSection from './PricingSection';

const CreateGroupDialog = dynamic(() => import('./CreateGroupDialog'), {
  ssr: false,
});

interface PricingWithDialogProps {
  isBetaTest: boolean;
}

export default function PricingWithDialog({ isBetaTest }: PricingWithDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCtaClick = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <PricingSection isBetaTest={isBetaTest} onCtaClick={handleCtaClick} />
      <CreateGroupDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
