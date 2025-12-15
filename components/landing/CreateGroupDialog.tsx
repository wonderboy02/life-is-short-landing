'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { createGroupSchema } from '@/lib/validations/schemas';
import { toast } from 'sonner';

type FormData = z.infer<typeof createGroupSchema>;

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateGroupDialog({
  open,
  onOpenChange,
}: CreateGroupDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(createGroupSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || '그룹 생성에 실패했습니다.');
        return;
      }

      // 성공 시 토스트 및 페이지 이동
      toast.success('그룹이 생성되었습니다!');
      reset();
      onOpenChange(false);
      router.push(`/share/${result.data.shareCode}`);
    } catch (error) {
      console.error('그룹 생성 오류:', error);
      toast.error('서버 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-display">
            새 그룹 만들기
          </DialogTitle>
          <DialogDescription className="text-base">
            가족, 친구들과 함께 사진을 공유할 그룹을 만들어보세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          {/* 그룹 이름 */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              그룹 이름
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="예: 우리 가족 여행"
              className="h-12 text-base"
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-base">
              비밀번호
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="사진 삭제 시 필요합니다 (최소 6자)"
              className="h-12 text-base"
              {...register('password')}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
            <p className="text-xs text-neutral-500">
              이 비밀번호는 사진 삭제 시 사용됩니다. 잊지 않도록 주의하세요.
            </p>
          </div>

          {/* 제출 버튼 */}
          <Button
            type="submit"
            className="w-full h-12 text-base bg-neutral-900 hover:bg-neutral-800"
            disabled={isLoading}
          >
            {isLoading ? '생성 중...' : '그룹 만들기'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
