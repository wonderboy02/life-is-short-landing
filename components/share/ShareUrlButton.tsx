'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import ShareOptionsModal from './ShareOptionsModal';

interface ShareUrlButtonProps {
  url: string;
  title?: string;
  text?: string;
  buttonText?: string;
  showIcon?: boolean;
  creatorNickname?: string;
}

export default function ShareUrlButton({
  url,
  title = '추억 앨범',
  text = '함께 사진을 추가해보세요!',
  buttonText = '공유',
  showIcon = true,
  creatorNickname,
}: ShareUrlButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        {showIcon && <Share2 className="h-4 w-4" />}
        <span>{buttonText}</span>
      </Button>

      <ShareOptionsModal
        open={showModal}
        onOpenChange={setShowModal}
        url={url}
        title={title}
        text={text}
        creatorNickname={creatorNickname}
      />
    </>
  );
}
