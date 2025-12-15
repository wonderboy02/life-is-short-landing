'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import type { PhotoWithUrl } from '@/lib/supabase/types';

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
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // 사진 선택 모드
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

  // 사진 삭제
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<PhotoWithUrl | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchGroupDetail();
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
        setEditName(result.data.name);
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
    if (!editName.trim() && !editPassword.trim()) {
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

      const body: { name?: string; password?: string } = {};
      if (editName.trim() && editName !== group?.name) {
        body.name = editName.trim();
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
      {/* 뒤로가기 버튼 */}
      <Button variant="outline" onClick={() => router.push('/admin/dashboard')}>
        ← 대시보드로 돌아가기
      </Button>

      {/* 그룹 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">{group.name}</CardTitle>
          <CardDescription>
            <div className="space-y-1">
              <div>그룹 ID: <span className="font-mono text-xs">{group.id}</span></div>
              <div>공유 코드: <span className="font-mono font-semibold">{group.share_code}</span></div>
              <div>사진: {group.photo_count}장</div>
              <div className="text-xs">생성일: {formatDate(group.created_at)}</div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="default" onClick={handleCopyShareCode}>
            공유 링크 복사
          </Button>
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            그룹 정보 수정
          </Button>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                      <div className="text-white text-xs text-center space-y-1 mb-2">
                        <div className="font-semibold">
                          👤 {photo.uploader_nickname}
                        </div>
                        {photo.description && (
                          <div className="bg-black bg-opacity-50 px-2 py-1 rounded text-xs line-clamp-2 max-w-full">
                            {photo.description}
                          </div>
                        )}
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
              <Label htmlFor="edit-name">그룹 이름</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="그룹 이름"
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
    </div>
  );
}
