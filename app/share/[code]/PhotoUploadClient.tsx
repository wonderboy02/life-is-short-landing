'use client';

import PhotoUpload from '@/components/share/PhotoUpload';

interface PhotoUploadClientProps {
  groupId: string;
  token: string;
  onUploadSuccess: () => void;
  onPhotoUploaded?: () => void;
}

export default function PhotoUploadClient({
  groupId,
  token,
  onUploadSuccess,
  onPhotoUploaded,
}: PhotoUploadClientProps) {
  return (
    <PhotoUpload
      groupId={groupId}
      token={token}
      onUploadSuccess={onUploadSuccess}
      onPhotoUploaded={onPhotoUploaded}
    />
  );
}
