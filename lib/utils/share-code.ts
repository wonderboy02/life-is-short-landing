import { nanoid } from 'nanoid';

/**
 * 짧은 공유 코드 생성 (8자)
 * 예: "a7k9mP2x"
 */
export function generateShareCode(): string {
  return nanoid(8);
}

/**
 * Share Code 유효성 검증
 * - 길이: 8자
 * - 문자: 영문자 + 숫자만 (nanoid 기본)
 */
export function isValidShareCode(code: string): boolean {
  return /^[A-Za-z0-9_-]{8}$/.test(code);
}
