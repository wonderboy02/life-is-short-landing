'use client';

import PhotoGrid from '@/components/share/PhotoGrid';
import { usePhotos } from '@/hooks/use-photos';
import { Loader2 } from 'lucide-react';

interface PhotoGridClientProps {
  groupId: string;
}

export default function PhotoGridClient({ groupId }: PhotoGridClientProps) {
  const { photos, isLoading, error, refetch } = usePhotos(groupId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <PhotoGrid photos={photos} groupId={groupId} onDeleteSuccess={refetch} />
  );
}
