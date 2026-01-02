import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
}

interface UseTimerOptions {
  createdAt: string;
  deadlineHours?: number;
  testMode?: boolean;
  testTimeOffset?: number;
}

/**
 * 그룹 생성 시간 기준 마감 타이머 훅
 */
export function useTimer({
  createdAt,
  deadlineHours = 72,
  testMode = false,
  testTimeOffset = 0,
}: UseTimerOptions) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      let deadline: number;

      if (testMode) {
        // 테스트 모드: 현재 시간 기준으로 testTimeOffset만큼 시간 남음
        deadline = now + testTimeOffset * 60 * 60 * 1000;
      } else {
        // 실제 모드: createdAt 기준으로 deadlineHours 시간 후
        const created = new Date(createdAt).getTime();
        deadline = created + deadlineHours * 60 * 60 * 1000;
      }

      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ days, hours, minutes });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, [createdAt, deadlineHours, testMode, testTimeOffset]);

  const hasTimeLeft = timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0;

  return { timeLeft, hasTimeLeft };
}
