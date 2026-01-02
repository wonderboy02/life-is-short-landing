import { useState, useEffect } from 'react';

interface UseFirstVisitOptions {
  groupId: string;
  shareCode: string;
  isLoading: boolean;
}

/**
 * 첫 방문 모달 및 자동 스크롤 관리 훅
 */
export function useFirstVisit({ groupId, shareCode, isLoading }: UseFirstVisitOptions) {
  const [showFirstVisitModal, setShowFirstVisitModal] = useState(false);
  const visitKey = `service-intro-visited-${groupId}`;

  // 앨범 생성 직후 확인 및 모달 표시
  useEffect(() => {
    if (!isLoading) {
      const justCreatedCode = localStorage.getItem('album-just-created');

      if (justCreatedCode === shareCode) {
        setShowFirstVisitModal(true);
        localStorage.removeItem('album-just-created');
      }
    }
  }, [shareCode, isLoading]);

  const hasVisited = () => {
    return localStorage.getItem(visitKey) === 'true';
  };

  const markAsVisited = () => {
    localStorage.setItem(visitKey, 'true');
  };

  return {
    showFirstVisitModal,
    setShowFirstVisitModal,
    hasVisited,
    markAsVisited,
  };
}
