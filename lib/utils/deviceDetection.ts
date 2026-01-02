/**
 * 모바일 기기 여부를 감지합니다.
 * 보수적으로 판단하여 웬만하면 모바일로 감지합니다.
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  // User Agent 체크 (가장 확실한 방법)
  const mobileUserAgent = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // 터치 지원 + 작은 화면 = 모바일 가능성 높음
  const hasTouchAndSmallScreen =
    'ontouchstart' in window && window.innerWidth < 1024;

  // 둘 중 하나라도 해당되면 모바일로 판단 (보수적)
  return mobileUserAgent || hasTouchAndSmallScreen;
}
