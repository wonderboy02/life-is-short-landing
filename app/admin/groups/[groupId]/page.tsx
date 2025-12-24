'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { AdminGroupDetail } from '@/app/api/admin/groups/[groupId]/route';
import type {
  PhotoWithUrl,
  GroupTasksResponse,
  TaskAddRequest,
} from '@/lib/supabase/types';

interface Props {
  params: Promise<{ groupId: string }>;
}

export default function AdminGroupDetailPage({ params }: Props) {
  const { groupId } = use(params);
  const router = useRouter();

  const [group, setGroup] = useState<AdminGroupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 그룹 수정
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editComment, setEditComment] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // 사진 선택 모드
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

  // 사진 삭제
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<PhotoWithUrl | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 영상 상태 변경
  const [isUpdatingVideoStatus, setIsUpdatingVideoStatus] = useState(false);

  // Task 큐에 추가
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Record<string, { prompt: string; repeat_count: number }>>({});
  const [bulkPrompt, setBulkPrompt] = useState('');
  const [bulkRepeatCount, setBulkRepeatCount] = useState(1);

  // 그룹 Task 현황
  const [groupTasks, setGroupTasks] = useState<GroupTasksResponse | null>(null);

  // 영상 재생 모달
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchGroupDetail();
  }, [groupId]);

  useEffect(() => {
    fetchGroupTasks();
    const interval = setInterval(fetchGroupTasks, 5000); // 5초마다
    return () => clearInterval(interval);
  }, [groupId]);

  const fetchGroupDetail = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin');
        return;
      }

      const response = await fetch(`/api/admin/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        router.push('/admin');
        return;
      }

      if (result.success && result.data) {
        setGroup(result.data);
        setEditComment(result.data.comment);
      } else {
        setError(result.error || '그룹 정보를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('그룹 상세 조회 오류:', err);
      setError('서버 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyShareCode = async () => {
    if (!group) return;
    const shareUrl = `${window.location.origin}/share/${group.share_code}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('공유 링크가 복사되었습니다!');
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
      alert('복사에 실패했습니다.');
    }
  };

  const handleUpdateGroup = async () => {
    if (!editComment.trim() && !editPassword.trim()) {
      alert('수정할 내용을 입력하세요.');
      return;
    }

    setIsUpdating(true);

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin');
        return;
      }

      const body: { comment?: string; password?: string } = {};
      if (editComment.trim() && editComment !== group?.comment) {
        body.comment = editComment.trim();
      }
      if (editPassword.trim()) {
        body.password = editPassword.trim();
      }

      const response = await fetch(`/api/admin/groups/${groupId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        alert('그룹 정보가 수정되었습니다.');
        setEditDialogOpen(false);
        setEditPassword('');
        fetchGroupDetail();
      } else {
        alert(result.error || '그룹 정보 수정에 실패했습니다.');
      }
    } catch (err) {
      console.error('그룹 수정 오류:', err);
      alert('서버 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePhoto = async (photo: PhotoWithUrl) => {
    setPhotoToDelete(photo);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!photoToDelete) return;

    setIsDeleting(true);

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin');
        return;
      }

      const response = await fetch(`/api/admin/photos/${photoToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setGroup((prev) =>
          prev
            ? {
                ...prev,
                photos: prev.photos.filter((p) => p.id !== photoToDelete.id),
                photo_count: prev.photo_count - 1,
              }
            : null
        );
        setDeleteDialogOpen(false);
        setPhotoToDelete(null);
      } else {
        alert(result.error || '사진 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('사진 삭제 오류:', err);
      alert('서버 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadPhoto = (photo: PhotoWithUrl) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }

    const downloadUrl = `/api/admin/photos/${photo.id}/download?token=${encodeURIComponent(token)}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = photo.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (!group) return;
    if (selectedPhotos.size === group.photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(group.photos.map((p) => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPhotos.size === 0) return;

    if (!confirm(`선택한 ${selectedPhotos.size}개의 사진을 삭제하시겠습니까?`)) {
      return;
    }

    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }

    const deletePromises = Array.from(selectedPhotos).map((photoId) =>
      fetch(`/api/admin/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );

    try {
      await Promise.all(deletePromises);
      alert('선택한 사진이 삭제되었습니다.');
      setSelectedPhotos(new Set());
      setSelectionMode(false);
      fetchGroupDetail();
    } catch (err) {
      console.error('일괄 삭제 오류:', err);
      alert('일부 사진 삭제에 실패했습니다.');
    }
  };

  const handleBulkDownload = () => {
    if (selectedPhotos.size === 0) return;

    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }

    const photosToDownload = group?.photos.filter((p) => selectedPhotos.has(p.id)) || [];

    photosToDownload.forEach((photo, index) => {
      setTimeout(() => {
        handleDownloadPhoto(photo);
      }, index * 500);
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  const getVideoStatusBadge = (status: string | null) => {
    const statusConfig = {
      pending: { label: '대기', variant: 'secondary' as const },
      requested: { label: '신청됨', variant: 'default' as const },
      processing: { label: '처리중', variant: 'default' as const },
      completed: { label: '완료', variant: 'default' as const },
      failed: { label: '실패', variant: 'destructive' as const },
    };

    const config = statusConfig[(status || 'pending') as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const handleVideoStatusChange = async (newStatus: string) => {
    setIsUpdatingVideoStatus(true);

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin');
        return;
      }

      const response = await fetch(`/api/admin/groups/${groupId}/video`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ video_status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        // 그룹 상태 업데이트
        setGroup((prev) =>
          prev ? { ...prev, video_status: newStatus } : null
        );

        // 성공 피드백
        const statusLabel = {
          pending: '대기',
          requested: '신청됨',
          processing: '처리중',
          completed: '완료',
          failed: '실패',
        }[newStatus] || newStatus;

        alert(`✓ 영상 상태가 "${statusLabel}"(으)로 변경되었습니다.`);
      } else {
        alert('✗ ' + (result.error || '상태 변경에 실패했습니다.'));
      }
    } catch (err) {
      console.error('영상 상태 변경 오류:', err);
      alert('✗ 서버 오류가 발생했습니다.');
    } finally {
      setIsUpdatingVideoStatus(false);
    }
  };

  const fetchGroupTasks = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const response = await fetch(`/api/admin/groups/${groupId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success) {
        setGroupTasks(result.data);
      }
    } catch (error) {
      console.error('Group tasks 조회 오류:', error);
    }
  };

  const getTotalTaskCount = () => {
    return Object.values(selectedTasks).reduce((sum, task) => sum + task.repeat_count, 0);
  };

  const handleAddAllWithOne = () => {
    if (!group) return;
    const newTasks: Record<string, { prompt: string; repeat_count: number }> = {};
    group.photos.forEach((photo) => {
      newTasks[photo.id] = {
        prompt: 'Generate video',
        repeat_count: 1,
      };
    });
    setSelectedTasks(newTasks);
  };

  const handleApplyBulkSettings = () => {
    if (!group || !bulkPrompt.trim()) {
      alert('프롬프트를 입력하세요.');
      return;
    }
    const newTasks: Record<string, { prompt: string; repeat_count: number }> = {};
    group.photos.forEach((photo) => {
      newTasks[photo.id] = {
        prompt: bulkPrompt,
        repeat_count: bulkRepeatCount,
      };
    });
    setSelectedTasks(newTasks);
  };

  const handlePlayVideo = (videoUrl: string, taskId: string) => {
    setCurrentVideoUrl(videoUrl);
    setCurrentTaskId(taskId);
    setVideoModalOpen(true);
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
        fetchGroupTasks();
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
        fetchGroupTasks();
      } else {
        alert('✗ ' + (result.error || 'Task 재시도에 실패했습니다.'));
      }
    } catch (error) {
      console.error('Task 재시도 오류:', error);
      alert('✗ 서버 오류가 발생했습니다.');
    }
  };

  const handleAddTasks = async () => {
    const tasksToAdd = Object.entries(selectedTasks)
      .filter(([_, task]) => task.repeat_count > 0 && task.prompt.trim())
      .map(([photo_id, task]) => ({
        photo_id,
        prompt: task.prompt,
        repeat_count: task.repeat_count,
      }));

    if (tasksToAdd.length === 0) {
      alert('추가할 task가 없습니다.');
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin');
        return;
      }

      const requestBody: TaskAddRequest = {
        group_id: groupId,
        tasks: tasksToAdd,
      };

      const response = await fetch('/api/admin/tasks/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        alert(`✓ ${result.data.total_items_added}개 task가 큐에 추가되었습니다!`);
        setTaskDialogOpen(false);
        setSelectedTasks({});
        fetchGroupTasks(); // 새로고침
      } else {
        alert(`✗ ${result.error}`);
      }
    } catch (error) {
      console.error('Task 추가 오류:', error);
      alert('✗ 서버 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-500">로딩 중...</div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-red-600">{error || '그룹을 찾을 수 없습니다.'}</div>
        <Button onClick={() => router.push('/admin/dashboard')}>대시보드로 돌아가기</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 뒤로가기 및 네비게이션 버튼 */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.push('/admin/dashboard')}>
          ← 대시보드로 돌아가기
        </Button>
        <Button variant="outline" onClick={() => router.push('/admin/queue')}>
          전체 큐 현황 보기
        </Button>
      </div>

      {/* 그룹 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">{group.comment}</CardTitle>
          <CardDescription>
            <div className="space-y-1">
              <div>그룹 ID: <span className="font-mono text-xs">{group.id}</span></div>
              <div>공유 코드: <span className="font-mono font-semibold">{group.share_code}</span></div>
              <div>생성자: {group.creator_nickname}</div>
              <div>연락처: {group.contact}</div>
              <div>사진: {group.photo_count}장</div>
              <div className="text-xs">생성일: {formatDate(group.created_at)}</div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 영상 상태 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              영상 제작 상태
            </label>
            <Select
              value={group.video_status || 'pending'}
              onValueChange={handleVideoStatusChange}
              disabled={isUpdatingVideoStatus}
            >
              <SelectTrigger className="w-full" disabled={isUpdatingVideoStatus}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">대기</SelectItem>
                <SelectItem value="requested">신청됨</SelectItem>
                <SelectItem value="processing">처리중</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
                <SelectItem value="failed">실패</SelectItem>
              </SelectContent>
            </Select>
            {isUpdatingVideoStatus && (
              <p className="text-xs text-neutral-500 flex items-center gap-1">
                <span className="inline-block animate-spin">⏳</span>
                상태 변경 중...
              </p>
            )}
          </div>

          {/* 액션 버튼들 */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="default" onClick={handleCopyShareCode}>
              공유 링크 복사
            </Button>
            <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
              그룹 정보 수정
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 사진 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>사진 목록</CardTitle>
              <CardDescription>총 {group.photos.length}장</CardDescription>
            </div>
            <div className="flex gap-2">
              {selectionMode ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedPhotos.size === group.photos.length ? '전체 해제' : '전체 선택'}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleBulkDownload}
                    disabled={selectedPhotos.size === 0}
                  >
                    선택 다운로드 ({selectedPhotos.size})
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={selectedPhotos.size === 0}
                  >
                    선택 삭제 ({selectedPhotos.size})
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectionMode(false);
                    setSelectedPhotos(new Set());
                  }}>
                    취소
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectionMode(true)}
                  disabled={group.photos.length === 0}
                >
                  선택 모드
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {group.photos.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              등록된 사진이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {group.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group border rounded-lg overflow-hidden bg-neutral-100 aspect-square"
                >
                  {/* 선택 체크박스 */}
                  {selectionMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <Checkbox
                        checked={selectedPhotos.has(photo.id)}
                        onCheckedChange={() => togglePhotoSelection(photo.id)}
                        className="bg-white"
                      />
                    </div>
                  )}

                  {/* 사진 */}
                  <img
                    src={photo.url}
                    alt={photo.file_name}
                    className="w-full h-full object-cover"
                  />

                  {/* 호버 오버레이 */}
                  {!selectionMode && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 p-2">
                      {/* 업로더 정보 */}
                      <div className="text-white text-xs text-center mb-2">
                        <div className="font-semibold">
                          👤 {photo.uploader_nickname}
                        </div>
                      </div>
                      {/* 액션 버튼 */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownloadPhoto(photo)}
                        >
                          다운로드
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePhoto(photo)}
                        >
                          삭제
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* 파일명 */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 truncate">
                    {photo.file_name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task 관리 버튼 */}
      <div className="flex gap-2">
        <Button variant="default" onClick={() => setTaskDialogOpen(true)}>
          Task 큐에 추가
        </Button>
      </div>

      {/* 그룹 Task 현황 */}
      {groupTasks && (
        <Card>
          <CardHeader>
            <CardTitle>비디오 생성 Task 현황</CardTitle>
            <CardDescription>
              전체 {groupTasks.stats.total}개 task
              (Pending: {groupTasks.stats.pending}, Processing: {groupTasks.stats.processing}, Completed: {groupTasks.stats.completed}, Failed: {groupTasks.stats.failed})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {groupTasks.photos.length === 0 ? (
              <p className="text-neutral-500 text-sm">아직 생성된 task가 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {groupTasks.photos.map((photoGroup) => (
                  <div key={photoGroup.photo_id} className="border rounded p-4">
                    <div className="flex gap-4">
                      {photoGroup.photo_url && (
                        <img
                          src={photoGroup.photo_url}
                          alt="Photo"
                          className="w-32 h-32 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">
                          이 사진의 비디오 ({photoGroup.tasks.length}개)
                        </h4>
                        <div className="space-y-2">
                          {photoGroup.tasks.map((task) => (
                            <div key={task.id} className="flex items-center gap-2 text-sm">
                              <Badge
                                variant={
                                  task.status === 'completed'
                                    ? 'default'
                                    : task.status === 'failed'
                                      ? 'destructive'
                                      : task.status === 'processing'
                                        ? 'secondary'
                                        : 'outline'
                                }
                              >
                                {task.status}
                              </Badge>
                              <span className="flex-1 truncate">{task.prompt}</span>

                              {/* 완료된 영상 */}
                              {task.status === 'completed' && task.generated_video_url && (
                                <div className="relative group/video">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handlePlayVideo(task.generated_video_url!, task.id)}
                                  >
                                    영상 보기
                                  </Button>
                                  {/* 호버 옵션 */}
                                  <div className="absolute right-0 top-full mt-1 hidden group-hover/video:flex gap-1 bg-white border rounded shadow-lg p-1 z-10">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDownloadVideo(task.generated_video_url!, task.id)}
                                    >
                                      다운로드
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDeleteTask(task.id)}
                                    >
                                      삭제
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* 실패한 Task */}
                              {task.status === 'failed' && (
                                <div className="flex items-center gap-2">
                                  {task.error_message && (
                                    <span className="text-xs text-red-600">{task.error_message}</span>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRetryTask(task.id)}
                                  >
                                    재시도
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 그룹 수정 다이얼로그 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>그룹 정보 수정</DialogTitle>
            <DialogDescription>
              그룹 이름과 비밀번호를 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-comment">가족들에게 한마디</Label>
              <Input
                id="edit-comment"
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                placeholder="가족들에게 한마디"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">새 비밀번호 (선택)</Label>
              <Input
                id="edit-password"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="변경하려면 입력"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isUpdating}>
              취소
            </Button>
            <Button onClick={handleUpdateGroup} disabled={isUpdating}>
              {isUpdating ? '수정 중...' : '수정'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task 큐에 추가 다이얼로그 */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task 큐에 추가</DialogTitle>
            <DialogDescription>
              각 사진별로 프롬프트와 반복 횟수를 설정하세요
            </DialogDescription>
          </DialogHeader>

          {/* 일괄 설정 */}
          <div className="border rounded p-4 space-y-3 bg-neutral-50">
            <h4 className="font-semibold text-sm">일괄 설정</h4>
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">모든 사진에 적용할 프롬프트</Label>
                <Input
                  placeholder="예: happy family moment"
                  value={bulkPrompt}
                  onChange={(e) => setBulkPrompt(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">반복 횟수</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  className="w-20"
                  value={bulkRepeatCount}
                  onChange={(e) => setBulkRepeatCount(parseInt(e.target.value) || 1)}
                />
              </div>
              <Button variant="default" onClick={handleApplyBulkSettings}>
                모든 사진에 적용
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleAddAllWithOne}>
                전부 1개씩 추가하기
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {group && group.photos.map((photo) => (
              <div key={photo.id} className="border rounded p-4">
                <div className="flex gap-4">
                  <img src={photo.url} alt={photo.file_name} className="w-24 h-24 object-cover rounded" />

                  <div className="flex-1 space-y-2">
                    <div>
                      <Label>프롬프트</Label>
                      <Input
                        placeholder="예: happy family moment"
                        value={selectedTasks[photo.id]?.prompt || ''}
                        onChange={(e) =>
                          setSelectedTasks((prev) => ({
                            ...prev,
                            [photo.id]: {
                              ...prev[photo.id],
                              prompt: e.target.value,
                              repeat_count: prev[photo.id]?.repeat_count || 1,
                            },
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Label>반복 횟수:</Label>
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        className="w-20"
                        value={selectedTasks[photo.id]?.repeat_count || 0}
                        onChange={(e) =>
                          setSelectedTasks((prev) => ({
                            ...prev,
                            [photo.id]: {
                              ...prev[photo.id],
                              prompt: prev[photo.id]?.prompt || '',
                              repeat_count: parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                      <span className="text-sm text-neutral-500">(0 = 추가 안 함)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddTasks}>
              큐에 추가 ({getTotalTaskCount()}개 task)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 사진 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>사진 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{photoToDelete?.file_name}</strong>을(를) 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 영상 재생 모달 */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="max-w-4xl w-full p-0">
          <div className="relative w-full bg-black">
            {currentVideoUrl && (
              <video
                src={currentVideoUrl}
                controls
                autoPlay
                className="w-full h-auto max-h-[80vh]"
              />
            )}
          </div>
          <div className="p-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => currentVideoUrl && currentTaskId && handleDownloadVideo(currentVideoUrl, currentTaskId)}
            >
              다운로드
            </Button>
            <Button variant="outline" onClick={() => setVideoModalOpen(false)}>
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
