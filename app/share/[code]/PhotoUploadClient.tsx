'use client';

import PhotoUpload from '@/components/share/PhotoUpload';

interface PhotoUploadClientProps {
  groupId: string;
  token: string;
  onUploadSuccess: () => void;
  onPhotoUploaded?: () => void;
  onReady?: (triggerFileSelect: () => void) => void;
}

export default function PhotoUploadClient({
  groupId,
  token,
  onUploadSuccess,
  onPhotoUploaded,
  onReady,
}: PhotoUploadClientProps) {
  return (
    <PhotoUpload
      groupId={groupId}
      token={token}
      onUploadSuccess={onUploadSuccess}
      onPhotoUploaded={onPhotoUploaded}
      onReady={onReady}
    />
  );
}
