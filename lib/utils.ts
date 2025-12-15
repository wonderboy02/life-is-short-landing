import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAppUrl() {
  // Vercel Production에서 커스텀 도메인이 연결된 경우
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL && isProduction()) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  // Vercel 자동 생성 도메인 (.vercel.app)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // 로컬 개발 환경 폴백
  return 'http://localhost:3000'
}

/**
 * Vercel Production 환경인지 확인
 * @returns {boolean} production 환경이면 true
 */
export function isProduction(): boolean {
  return process.env.VERCEL_ENV === 'production'
}
