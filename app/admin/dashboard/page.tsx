'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import type { AdminGroupListItem } from '@/app/api/admin/groups/route';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<AdminGroupListItem[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<AdminGroupListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<AdminGroupListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredGroups(groups);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredGroups(
        groups.filter(
          (group) =>
            group.comment.toLowerCase().includes(query) ||
            group.share_code.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, groups]);

  const fetchGroups = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin');
        return;
      }

      const response = await fetch('/api/admin/groups', {
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

      if (result.success && result.data?.groups) {
        setGroups(result.data.groups);
        setFilteredGroups(result.data.groups);
      } else {
        setError(result.error || '그룹 목록을 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('그룹 목록 조회 오류:', err);
      setError('서버 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (group: AdminGroupListItem) => {
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!groupToDelete) return;

    setIsDeleting(true);

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin');
        return;
      }

      const response = await fetch(`/api/admin/groups/${groupToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        // 목록에서 제거
        setGroups((prev) => prev.filter((g) => g.id !== groupToDelete.id));
        setDeleteDialogOpen(false);
        setGroupToDelete(null);
      } else {
        alert(result.error || '그룹 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('그룹 삭제 오류:', err);
      alert('서버 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
        <Button onClick={fetchGroups}>다시 시도</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 검색 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display">그룹 목록</h2>
          <p className="text-sm text-neutral-500 mt-1">
            총 {groups.length}개의 그룹
          </p>
        </div>
        <Input
          type="search"
          placeholder="그룹명 또는 공유코드 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64"
        />
      </div>

      {/* 그룹 카드 그리드 */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          {searchQuery ? '검색 결과가 없습니다.' : '등록된 그룹이 없습니다.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="font-display">{group.comment}</CardTitle>
                <CardDescription>
                  <div className="space-y-1">
                    <div>공유 코드: <span className="font-mono font-semibold">{group.share_code}</span></div>
                    <div>사진: {group.photo_count}장</div>
                    <div className="text-xs">생성일: {formatDate(group.created_at)}</div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex gap-2">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => router.push(`/admin/groups/${group.id}`)}
                >
                  상세보기
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteClick(group)}
                >
                  삭제
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>그룹 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{groupToDelete?.name}</strong> 그룹을 삭제하시겠습니까?
              <br />
              이 그룹의 모든 사진({groupToDelete?.photo_count}장)도 함께 삭제됩니다.
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
