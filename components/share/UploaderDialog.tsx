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
import { User } from 'lucide-react';

const uploaderSchema = z.object({
  nickname: z
    .string()
    .min(1, '닉네임을 입력해주세요')
    .max(20, '닉네임은 최대 20자까지 가능합니다')
    .trim(),
});

type FormData = z.infer<typeof uploaderSchema>;

interface UploaderDialogProps {
  open: boolean;
  onConfirm: (nickname: string) => void;
}

export default function UploaderDialog({
  open,
  onConfirm,
}: UploaderDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(uploaderSchema),
  });

  const onSubmit = (data: FormData) => {
    onConfirm(data.nickname);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-neutral-600" />
            </div>
            <DialogTitle className="text-xl font-bold">
              환영합니다!
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            사진 업로드 전에 닉네임을 입력해주세요.
            <br />
            업로드한 사진에 표시됩니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-base">
              닉네임
            </Label>
            <Input
              id="nickname"
              type="text"
              placeholder="예: 엄마, 아빠, 철수"
              className="h-12 text-base"
              {...register('nickname')}
              autoFocus
            />
            {errors.nickname && (
              <p className="text-sm text-red-600">{errors.nickname.message}</p>
            )}
            <p className="text-xs text-neutral-500">
              언제든지 나중에 변경할 수 있습니다.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base bg-neutral-900 hover:bg-neutral-800"
          >
            시작하기
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
