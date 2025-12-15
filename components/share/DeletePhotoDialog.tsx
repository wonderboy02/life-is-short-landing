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
import { AlertTriangle } from 'lucide-react';

type FormData = z.infer<typeof deletePhotoSchema>;

interface DeletePhotoDialogProps {
  photoId: string;
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteSuccess?: () => void;
}

export default function DeletePhotoDialog({
  photoId,
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
      const response = await fetch(`/api/photos/${photoId}`, {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold">
              사진 삭제
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            이 작업은 되돌릴 수 없습니다. 그룹 비밀번호를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
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
      </DialogContent>
    </Dialog>
  );
}
