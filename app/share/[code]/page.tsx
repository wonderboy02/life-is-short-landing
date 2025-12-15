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

/**
 * 초기 photos 데이터 조회
 */
async function getInitialPhotos(groupId: string) {
  const baseUrl = getAppUrl();

  try {
    const response = await fetch(`${baseUrl}/api/photos?groupId=${groupId}`, {
      cache: 'no-store',
    });
    const result = await response.json();

    if (result.success) {
      return result.data.photos;
    }
    return [];
  } catch (error) {
    console.error('초기 사진 로딩 실패:', error);
    return [];
  }
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

  // 초기 photos 데이터 조회 (병렬 처리 가능하지만 groupId가 필요하므로 순차)
  const initialPhotos = await getInitialPhotos(groupData.groupId);

  const shareUrl = `${getAppUrl()}/share/${code}`;

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* 헤더 */}
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-neutral-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div>
              <h1 className="text-base font-semibold font-display text-neutral-900">
                {groupData.groupName}
              </h1>
              <p className="text-sm text-neutral-500">{groupData.creatorNickname}님과 만드는 추억 앨범</p>
            </div>
            <div className="relative">
              {/* 공유 버튼 강조를 위한 pulse 효과 */}
              <div className="absolute inset-0 animate-pulse bg-blue-100 rounded-md opacity-30 pointer-events-none" />
              <ShareUrlButton url={shareUrl} />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="bg-neutral-50">
        <SharePageClient
          groupId={groupData.groupId}
          groupName={groupData.groupName}
          creatorNickname={groupData.creatorNickname}
          token={groupData.token}
          initialPhotos={initialPhotos}
        />
      </div>
    </div>
  );
}
