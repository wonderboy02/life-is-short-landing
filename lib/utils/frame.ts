/**
 * 영상 길이(초)를 프레임 수로 변환
 * @param durationSeconds 영상 길이 (초)
 * @returns 프레임 수 (24 * 초 + 1)
 */
export function secondsToFrameNum(durationSeconds: number): number {
  if (durationSeconds <= 0) {
    throw new Error('durationSeconds must be greater than 0');
  }

  return 24 * durationSeconds + 1;
}

/**
 * 프레임 수가 유효한지 검증 (4n+1 형식)
 * @param frameNum 프레임 수
 * @returns 유효 여부
 */
export function isValidFrameNum(frameNum: number): boolean {
  return frameNum > 0 && (frameNum - 1) % 4 === 0;
}

/**
 * 프레임 수를 영상 길이(초)로 변환
 * @param frameNum 프레임 수
 * @returns 영상 길이 (초)
 */
export function frameNumToSeconds(frameNum: number): number {
  return (frameNum - 1) / 24;
}

/**
 * 영상 길이 프리셋
 */
export const DURATION_PRESETS = [
  { label: '3초', seconds: 3, frameNum: 73 },   // 24 * 3 + 1 = 73
  { label: '5초 (기본)', seconds: 5, frameNum: 121 }, // 24 * 5 + 1 = 121
  { label: '7초', seconds: 7, frameNum: 169 },  // 24 * 7 + 1 = 169
  { label: '10초', seconds: 10, frameNum: 241 }, // 24 * 10 + 1 = 241
] as const;
