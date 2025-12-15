'use client';

import { useState } from 'react';
import PhotoUploadClient from './PhotoUploadClient';
import PhotoGridClient from './PhotoGridClient';

interface SharePageClientProps {
  groupId: string;
  token: string;
}

export default function SharePageClient({
  groupId,
  token,
}: SharePageClientProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    // 업로드 성공 시 PhotoGrid 강제 새로고침
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 사진 업로드 섹션 */}
        <PhotoUploadClient
          groupId={groupId}
          token={token}
          onUploadSuccess={handleUploadSuccess}
        />

        {/* 사진 그리드 섹션 */}
        <div>
          <h2 className="text-lg font-semibold mb-4 font-display">
            공유된 사진
          </h2>
          <PhotoGridClient key={refreshKey} groupId={groupId} />
        </div>
      </div>
    </main>
  );
}
