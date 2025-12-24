'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ImageViewerModal from '@/components/share/ImageViewerModal';
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

  // 사진 확대 모달
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

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

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('이 Task를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin');
        return;
      }

      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        alert('✓ Task가 삭제되었습니다.');
        fetchQueue();
      } else {
        alert('✗ ' + (result.error || 'Task 삭제에 실패했습니다.'));
      }
    } catch (error) {
      console.error('Task 삭제 오류:', error);
      alert('✗ 서버 오류가 발생했습니다.');
    }
  };

  const handleRetryTask = async (taskId: string) => {
    if (!confirm('이 Task를 재시도하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin');
        return;
      }

      const response = await fetch(`/api/admin/tasks/${taskId}/retry`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        alert('✓ Task가 재시도 큐에 추가되었습니다.');
        fetchQueue();
      } else {
        alert('✗ ' + (result.error || 'Task 재시도에 실패했습니다.'));
      }
    } catch (error) {
      console.error('Task 재시도 오류:', error);
      alert('✗ 서버 오류가 발생했습니다.');
    }
  };

  const handleDownloadVideo = async (videoUrl: string, taskId: string) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `video-${taskId}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('다운로드 오류:', error);
      alert('다운로드에 실패했습니다.');
    }
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
                  {queueData.items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.photo_url && (
                          <img
                            src={item.photo_url}
                            alt="Photo"
                            className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedImageIndex(index)}
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
                        <div className="flex flex-col gap-2">
                          {/* Completed 상태 */}
                          {item.status === 'completed' && item.generated_video_url && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleDownloadVideo(item.generated_video_url!, item.id)}
                              >
                                다운로드
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteTask(item.id)}
                              >
                                삭제
                              </Button>
                            </div>
                          )}

                          {/* Pending 상태만 삭제 가능 */}
                          {item.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteTask(item.id)}
                              >
                                삭제
                              </Button>
                            </div>
                          )}

                          {/* Failed 상태 */}
                          {item.status === 'failed' && (
                            <>
                              {item.error_message && (
                                <div className="text-xs text-red-600 max-w-xs truncate mb-1">
                                  {item.error_message}
                                </div>
                              )}
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRetryTask(item.id)}
                                >
                                  재시도
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteTask(item.id)}
                                >
                                  삭제
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 사진 확대 모달 */}
      {selectedImageIndex !== null && queueData && (
        <ImageViewerModal
          images={queueData.items
            .filter((item) => item.photo_url)
            .map((item) => ({
              url: item.photo_url!,
              alt: item.prompt || 'Photo',
            }))}
          initialIndex={selectedImageIndex}
          open={selectedImageIndex !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedImageIndex(null);
          }}
        />
      )}
    </div>
  );
}
