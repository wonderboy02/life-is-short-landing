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
  return {
    text: `🎉 새로운 그룹이 생성되었습니다! (${data.creatorNickname})`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎉 새로운 그룹 생성',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*생성자:*\n${data.creatorNickname}`,
          },
          {
            type: 'mrkdwn',
            text: `*Share Code:*\n\`${data.shareCode}\``,
          },
          {
            type: 'mrkdwn',
            text: `*연락처:*\n${data.contact}`,
          },
          {
            type: 'mrkdwn',
            text: `*그룹 ID:*\n\`${data.groupId}\``,
          },
        ],
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*코멘트:*\n${data.comment || '(없음)'}`,
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `⏰ ${formatDateTime(data.createdAt)}`,
          },
        ],
      },
    ],
  };
}

/**
 * 사진 업로드 알림 메시지를 생성합니다.
 */
export function createPhotoUploadedMessage(data: PhotoUploadedData): SlackMessage {
  const fields = [
    {
      type: 'mrkdwn',
      text: `*업로더:*\n${data.uploaderNickname}`,
    },
    {
      type: 'mrkdwn',
      text: `*그룹 ID:*\n\`${data.groupId}\``,
    },
    {
      type: 'mrkdwn',
      text: `*파일명:*\n${data.fileName}`,
    },
    {
      type: 'mrkdwn',
      text: `*파일 크기:*\n${formatFileSize(data.fileSize)}`,
    },
    {
      type: 'mrkdwn',
      text: `*파일 타입:*\n${data.mimeType}`,
    },
    {
      type: 'mrkdwn',
      text: `*사진 ID:*\n\`${data.photoId}\``,
    },
  ];

  // Share Code가 있으면 추가
  if (data.shareCode) {
    fields.splice(2, 0, {
      type: 'mrkdwn',
      text: `*Share Code:*\n\`${data.shareCode}\``,
    });
  }

  const blocks: SlackMessage['blocks'] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📸 새로운 사진 업로드',
      },
    },
    {
      type: 'section',
      fields,
    },
  ];

  // 설명이 있으면 추가
  if (data.description) {
    blocks.push({
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*설명:*\n${data.description}`,
        },
      ],
    });
  }

  // 시간 정보
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `⏰ ${formatDateTime(data.uploadedAt)}`,
      },
    ],
  });

  return {
    text: `📸 새로운 사진이 업로드되었습니다! (${data.uploaderNickname})`,
    blocks,
  };
}
