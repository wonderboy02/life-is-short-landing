/**
 * Slack Webhook 유틸리티
 * Incoming Webhook을 통해 Slack으로 메시지를 전송합니다.
 */

export interface SlackMessage {
  text: string;
  blocks?: Array<{
    type: string;
    text?: {
      type: string;
      text: string;
    };
    fields?: Array<{
      type: string;
      text: string;
    }>;
  }>;
}

/**
 * Slack Webhook URL로 메시지를 전송합니다.
 * 비동기로 실행되며, 실패해도 에러를 throw하지 않습니다 (fire-and-forget).
 *
 * @param message - 전송할 Slack 메시지
 */
export async function sendSlackNotification(message: SlackMessage): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  // Webhook URL이 없으면 조용히 무시
  if (!webhookUrl) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Slack] SLACK_WEBHOOK_URL이 설정되지 않았습니다.');
    }
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[Slack] 메시지 전송 실패:', response.status, text);
    }
  } catch (error) {
    // 에러가 발생해도 무시 (Slack 전송 실패가 API 응답에 영향을 주면 안 됨)
    console.error('[Slack] 메시지 전송 중 오류:', error);
  }
}

/**
 * 메시지를 비동기로 전송합니다 (fire-and-forget).
 * await 없이 호출하면 백그라운드에서 실행됩니다.
 *
 * @param message - 전송할 Slack 메시지
 */
export function sendSlackNotificationAsync(message: SlackMessage): void {
  // Promise를 await하지 않고 실행 (fire-and-forget)
  sendSlackNotification(message).catch((error) => {
    console.error('[Slack] 비동기 메시지 전송 실패:', error);
  });
}
