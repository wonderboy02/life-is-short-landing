'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ShareUrlButtonProps {
  url: string;
}

export default function ShareUrlButton({ url }: ShareUrlButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('URL이 복사되었습니다!');

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('복사 실패:', error);
      toast.error('URL 복사에 실패했습니다.');
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          <span>복사됨</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>URL 복사</span>
        </>
      )}
    </Button>
  );
}
