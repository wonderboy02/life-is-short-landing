import { clsx, type ClassValue } from 'clsx';
import { is } from 'date-fns/locale';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAppUrl() {
  // 1. 수동 설정된 앱 URL (최우선 - 모든 환경에서 오버라이드 가능)
  if (process.env.NEXT_PUBLIC_APP_URL && isProduction()) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // 2. Vercel Branch/Preview 환경 (PR, Git branch)
  // Preview 환경에서는 VERCEL_BRANCH_URL 사용
  if (process.env.VERCEL_BRANCH_URL && !isProduction()) {
    return `https://${process.env.VERCEL_BRANCH_URL}`;
  }

  // 3. Vercel 일반 배포 URL (모든 deployment)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 4. Vercel Production 커스텀 도메인
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL && isProduction()) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  // 5. 로컬 개발 환경 폴백
  return 'http://localhost:3000';
}

/**
 * Vercel Production 환경인지 확인
 * @returns {boolean} production 환경이면 true
 */
export function isProduction(): boolean {
  return process.env.VERCEL_ENV === 'production';
}

/**
 * 한국어 받침 유무에 따라 적절한 조사를 반환
 * @param name - 이름
 * @returns 받침이 있으면 "과", 없으면 "와"
 */
function getParticle(name: string): '과' | '와' {
  if (!name) return '와';

  const lastChar = name[name.length - 1];
  const charCode = lastChar.charCodeAt(0);

  // 한글이 아닌 경우 기본값 '와' 반환
  if (charCode < 0xac00 || charCode > 0xd7a3) {
    return '와';
  }

  // 받침이 있는지 확인 (종성이 있으면 받침 있음)
  const hasJongseong = (charCode - 0xac00) % 28 !== 0;

  return hasJongseong ? '과' : '와';
}

/**
 * 이름에 "님"과 적절한 조사를 붙여 반환
 * @param name - 이름
 * @returns "{name}님과" 또는 "{name}님과" (받침에 따라)
 * @example
 * formatNameWithParticle("철수") // "철수님과"
 * formatNameWithParticle("영희") // "영희님과"
 */
export function formatNameWithParticle(name: string): string {
  const particle = getParticle(name);
  return `${name}님${particle}`;
}

/**
 * 카카오톡 인앱 브라우저(웹뷰)인지 확인
 * - Production: User Agent만 체크
 * - Development: User Agent + localStorage 시뮬레이션 플래그 체크
 * @returns {boolean} 카카오톡 웹뷰이면 true
 */
export function isKakaoTalkWebView(): boolean {
  if (typeof navigator === 'undefined') return false;

  // 실제 User Agent 체크
  const isRealKakao = /KAKAOTALK/i.test(navigator.userAgent);

  // 개발 환경에서만 시뮬레이션 플래그 체크
  if (process.env.NODE_ENV !== 'production') {
    const forceKakao =
      typeof localStorage !== 'undefined' && localStorage.getItem('dev-force-kakao') === 'true';
    return isRealKakao || forceKakao;
  }

  return isRealKakao;
}
