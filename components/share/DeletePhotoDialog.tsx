'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deletePhotoSchema } from '@/lib/validations/schemas';
import { toast } from 'sonner';
import { AlertTriangle, User, Calendar } from 'lucide-react';
import type { PhotoWithUrl } from '@/lib/supabase/types';

type FormData = z.infer<typeof deletePhotoSchema>;

interface DeletePhotoDialogProps {
  photo: PhotoWithUrl;
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteSuccess?: () => void;
}

export default function DeletePhotoDialog({
  photo,
  groupId,
  open,
  onOpenChange,
  onDeleteSuccess,
}: DeletePhotoDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(deletePhotoSchema),
    defaultValues: {
      groupId,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/photos/${photo.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || '사진 삭제에 실패했습니다.');
        return;
      }

      toast.success('사진이 삭제되었습니다.');
      reset();
      onDeleteSuccess?.();
    } catch (error) {
      console.error('사진 삭제 오류:', error);
      toast.error('서버 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 업로드 시간 포맷팅
  const formatUploadTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${year}년 ${month}월 ${day}일 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {photo.uploader_nickname} 님이 업로드한 사진
          </DialogTitle>

          {/* 사진 정보 */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Calendar className="w-4 h-4 text-neutral-500" />
              <span>{formatUploadTime(photo.created_at)}</span>
            </div>
          </div>
        </DialogHeader>

        {/* 삭제 옵션 */}
        <div className="mt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-900">
                  사진을 삭제하시겠습니까?
                </p>
                <p className="text-xs text-red-700">
                  이 작업은 되돌릴 수 없습니다. 삭제하려면 그룹 비밀번호를 입력해주세요.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 비밀번호 */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-base">
              그룹 비밀번호
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="그룹 생성 시 설정한 비밀번호"
              className="h-11"
              {...register('password')}
              disabled={isDeleting}
              autoFocus
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* 버튼 그룹 */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
