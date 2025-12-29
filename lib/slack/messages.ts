/**
 * Slack 메시지 포맷팅 유틸리티
 * 각 이벤트별로 Slack Block Kit 형식의 메시지를 생성합니다.
 */

import type { SlackMessage } from './webhook';

export interface GroupCreatedData {
  groupId: string;
  shareCode: string;
  creatorNickname: string;
  contact: string;
  comment: string;
  createdAt: string;
}

export interface PhotoUploadedData {
  photoId: string;
  groupId: string;
  shareCode?: string; // 조회 필요한 경우 optional
  uploaderNickname: string;
  fileName: string;
  fileSize: number; // bytes
  mimeType: string;
  description?: string;
  uploadedAt: string;
}

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환합니다.
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * ISO 날짜를 읽기 쉬운 한국 시간으로 변환합니다.
 */
function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Seoul',
  }).format(date);
}

/**
 * 그룹 생성 알림 메시지를 생성합니다.
 */
export function createGroupCreatedMessage(data: GroupCreatedData): SlackMessage {
  const time = formatDateTime(data.createdAt);
  return {
    text: `*그룹 생성*\n${data.creatorNickname} / ${data.contact} / ${data.shareCode} / ${data.groupId} / ${time}`,
  };
}

/**
 * 사진 업로드 알림 메시지를 생성합니다.
 */
export function createPhotoUploadedMessage(data: PhotoUploadedData): SlackMessage {
  const time = formatDateTime(data.uploadedAt);
  return {
    text: `📸 *사진 업로드*\n${data.uploaderNickname} / ${data.shareCode || 'N/A'} / ${data.groupId} / ${time}`,
  };
}
