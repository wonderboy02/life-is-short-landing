/**
 * Worker API 인증 유틸리티
 * Authorization: Worker <API_KEY> 형식의 헤더를 검증합니다.
 */

/**
 * Worker 인증 헤더 검증
 * @param authHeader Authorization 헤더 값
 * @returns 유효한 경우 true, 그렇지 않으면 false
 * @throws WORKER_API_KEY가 설정되지 않은 경우 에러
 */
export function verifyWorkerAuth(authHeader: string | null): boolean {
  const apiKey = process.env.WORKER_API_KEY;

  if (!apiKey) {
    throw new Error('WORKER_API_KEY not configured');
  }

  if (!authHeader || !authHeader.startsWith('Worker ')) {
    return false;
  }

  const token = authHeader.substring(7);
  return token === apiKey;
}
