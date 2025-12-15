import { notFound } from 'next/navigation';
import { isValidShareCode } from '@/lib/utils/share-code';
import { getAppUrl } from '@/lib/utils';
import SharePageClient from './SharePageClient';
import ShareUrlButton from '@/components/share/ShareUrlButton';

interface Props {
  params: Promise<{ code: string }>;
}

/**
 * Share Code로 그룹 조회 + JWT 발급
 */
async function getGroupData(shareCode: string) {
  const baseUrl = getAppUrl();

  const response = await fetch(`${baseUrl}/api/groups/verify?code=${shareCode}`, {
    cache: 'no-store', // 항상 최신 데이터 조회
  });

  if (!response.ok) {
    return null;
  }

  const result = await response.json();
  return result.success ? result.data : null;
}

export default async function SharePage({ params }: Props) {
  const { code } = await params;

  // Share Code 검증
  if (!isValidShareCode(code)) {
    notFound();
  }

  // 그룹 데이터 조회 + JWT 발급
  const groupData = await getGroupData(code);
  if (!groupData) {
    notFound();
  }

  const shareUrl = `${getAppUrl()}/share/${code}`;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-900">
                {groupData.groupName}
              </h1>
              <p className="text-sm text-neutral-500">사진 공유 그룹</p>
            </div>
            <ShareUrlButton url={shareUrl} />
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <SharePageClient
        groupId={groupData.groupId}
        token={groupData.token}
      />
    </div>
  );
}
