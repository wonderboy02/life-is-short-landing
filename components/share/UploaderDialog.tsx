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
  onOpenChange?: (open: boolean) => void;
}

export default function UploaderDialog({ open, onConfirm, onOpenChange }: UploaderDialogProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
              <User className="h-5 w-5 text-neutral-600" />
            </div>
            <DialogTitle className="text-xl font-bold">당신은 누구신가요?</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            가족이 당신을 알아볼 수 있게
            <br />
            사진에 표시되는 닉네임을 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-base">
              닉네임
            </Label>
            <Input
              id="nickname"
              type="text"
              placeholder="예: 홍길동, 아빠, 큰딸"
              className="h-12 text-base"
              {...register('nickname')}
              autoFocus
            />
            {errors.nickname && <p className="text-sm text-red-600">{errors.nickname.message}</p>}
            <p className="text-xs text-neutral-500">언제든지 나중에 변경할 수 있습니다.</p>
          </div>

          <Button
            type="submit"
            className="h-12 w-full bg-neutral-900 text-base hover:bg-neutral-800"
          >
            시작하기
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
