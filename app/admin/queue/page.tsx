'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

interface QueueItem {
  id: string;
  group_id: string;
  photo_id: string;
  photo_url: string;
  prompt: string;
  status: string;
  worker_id: string | null;
  error_message: string | null;
  retry_count: number;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  generated_video_url: string | null;
  created_at: string;
}

interface QueueData {
  stats: QueueStats;
  items: QueueItem[];
}

export default function AdminQueuePage() {
  const router = useRouter();

  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 필터
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000); // 5초마다
    return () => clearInterval(interval);
  }, [filterStatus]);

  const fetchQueue = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin');
        return;
      }

      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await fetch(`/api/admin/tasks/queue?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        router.push('/admin');
        return;
      }

      if (result.success) {
        setQueueData(result.data);
      } else {
        setError(result.error || '큐 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('큐 조회 오류:', error);
      setError('서버 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-500">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-red-600">{error}</div>
        <Button onClick={() => router.push('/admin/dashboard')}>대시보드로 돌아가기</Button>
      </div>
    );
  }

  if (!queueData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 뒤로가기 버튼 */}
      <Button variant="outline" onClick={() => router.push('/admin/dashboard')}>
        ← 대시보드로 돌아가기
      </Button>

      {/* 전체 큐 통계 */}
      <Card>
        <CardHeader>
          <CardTitle>전체 Task 큐</CardTitle>
          <CardDescription>
            Pending: {queueData.stats.pending} | Processing: {queueData.stats.processing} |
            Completed: {queueData.stats.completed} | Failed: {queueData.stats.failed}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 필터 */}
          <div className="flex gap-2 mb-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Task 테이블 */}
          {queueData.items.length === 0 ? (
            <p className="text-neutral-500 text-sm">표시할 task가 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사진</TableHead>
                    <TableHead>프롬프트</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>Worker</TableHead>
                    <TableHead>생성 시간</TableHead>
                    <TableHead>액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queueData.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.photo_url && (
                          <img
                            src={item.photo_url}
                            alt="Photo"
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{item.prompt}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === 'completed'
                              ? 'default'
                              : item.status === 'failed'
                                ? 'destructive'
                                : item.status === 'processing'
                                  ? 'secondary'
                                  : 'outline'
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {item.worker_id ? item.worker_id.substring(0, 8) : '-'}
                      </TableCell>
                      <TableCell className="text-xs">{formatDate(item.created_at)}</TableCell>
                      <TableCell>
                        {item.status === 'completed' && item.generated_video_url && (
                          <Button size="sm" asChild>
                            <a href={item.generated_video_url} download>
                              다운로드
                            </a>
                          </Button>
                        )}
                        {item.error_message && (
                          <div className="text-xs text-red-600 max-w-xs truncate">
                            {item.error_message}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
