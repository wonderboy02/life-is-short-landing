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

/**
 * 한국어 받침 유무에 따라 적절한 조사를 반환
 * @param name - 이름
 * @returns 받침이 있으면 "과", 없으면 "와"
 */
function getParticle(name: string): '과' | '와' {
  if (!name) return '와'

  const lastChar = name[name.length - 1]
  const charCode = lastChar.charCodeAt(0)

  // 한글이 아닌 경우 기본값 '와' 반환
  if (charCode < 0xAC00 || charCode > 0xD7A3) {
    return '와'
  }

  // 받침이 있는지 확인 (종성이 있으면 받침 있음)
  const hasJongseong = (charCode - 0xAC00) % 28 !== 0

  return hasJongseong ? '과' : '와'
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
  const particle = getParticle(name)
  return `${name}님${particle}`
}
