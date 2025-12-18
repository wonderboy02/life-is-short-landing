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
import { Textarea } from '@/components/ui/textarea';
import { createGroupSchema } from '@/lib/validations/schemas';
import { toast } from 'sonner';
import { Sparkles, X, User, MessageCircle, Lock, Camera } from 'lucide-react';

type FormData = z.infer<typeof createGroupSchema>;

const SUGGESTED_COMMENTS = [
  '아버지, 청춘의 모습이 궁금해요',
  '엄마의 젊은 날을 보고 싶어요',
  '가족의 옛 모습을 영상으로 남기고 싶어요',
  '부모님의 추억을 함께 모아봐요',
  '할머니, 할아버지의 젊은 시절이 궁금해요',
];

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(createGroupSchema),
  });

  const handleSuggestedComment = () => {
    const randomComment = SUGGESTED_COMMENTS[Math.floor(Math.random() * SUGGESTED_COMMENTS.length)];
    setValue('comment', randomComment);
  };

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
        toast.error(result.error || '앨범 생성에 실패했습니다.');
        return;
      }

      // 성공 시 페이지 이동
      reset();
      onOpenChange(false);

      // 앨범 생성 직후임을 표시하는 플래그 저장
      localStorage.setItem('album-just-created', result.data.shareCode);

      router.push(`/share/${result.data.shareCode}`);
    } catch (error) {
      console.error('앨범 생성 오류:', error);
      toast.error('서버 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-full w-full max-w-none flex-col overflow-hidden rounded-none p-0 sm:h-auto sm:max-w-md sm:rounded-lg"
        showCloseButton={false}
      >
        {/* Visual Header with Gradient */}
        <div className="relative bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50 px-6 pt-8 pb-6">
          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 rounded-full p-2 transition-colors hover:bg-neutral-200/50"
            aria-label="닫기"
          >
            <X className="h-5 w-5 text-neutral-600" />
          </button>

          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
              <Camera className="h-8 w-8 text-neutral-900" />
            </div>
          </div>

          {/* Header Text */}
          <DialogHeader className="space-y-2">
            <DialogTitle className="font-display text-center text-2xl font-bold">
              그때 그 시절 앨범 만들기
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              부모님의 청춘, 가족의 잊혀진 순간들을 모아보세요
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Form Area */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
            {/* 생성자 닉네임 */}
            <div className="space-y-2">
              <Label htmlFor="creatorNickname" className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-neutral-600" />
                앨범 주인
              </Label>
              <Input
                id="creatorNickname"
                type="text"
                placeholder="예: 큰아들"
                className="h-12 border-neutral-200 text-base transition-colors focus:border-neutral-400"
                {...register('creatorNickname')}
                disabled={isLoading}
              />
              {errors.creatorNickname && (
                <p className="text-sm text-red-600">{errors.creatorNickname.message}</p>
              )}
              <p className="text-xs text-neutral-500">
                옛 사진을 모으실 분의 닉네임을 입력해주세요
              </p>
            </div>

            {/* 가족들에게 한마디 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="comment" className="flex items-center gap-2 text-base">
                  <MessageCircle className="h-4 w-4 text-neutral-600" />
                  가족들에게 한마디
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSuggestedComment}
                  disabled={isLoading}
                  className="h-8 gap-1 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  추천 한마디
                </Button>
              </div>
              <Textarea
                id="comment"
                placeholder="예: 아버지, 청춘의 모습이 궁금해요"
                className="min-h-[80px] resize-none border-neutral-200 text-base transition-colors focus:border-neutral-400"
                {...register('comment')}
                disabled={isLoading}
              />
              {errors.comment && <p className="text-sm text-red-600">{errors.comment.message}</p>}
              <p className="text-xs text-neutral-500">
                가족들에게 전하고 싶은 따뜻한 한마디를 남겨주세요
              </p>
            </div>

            {/* 비밀번호 */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-base">
                <Lock className="h-4 w-4 text-neutral-600" />
                비밀번호
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="사진 삭제 시 필요합니다 (최소 6자)"
                className="h-12 border-neutral-200 text-base transition-colors focus:border-neutral-400"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
              <p className="text-xs text-neutral-500">
                이 비밀번호는 사진 삭제 시 사용됩니다. 잊지 않도록 주의하세요.
              </p>
            </div>
          </div>

          {/* Sticky Bottom Button */}
          <div className="sticky bottom-0 border-t border-neutral-100 bg-white px-6 py-4 shadow-lg">
            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-neutral-900 text-base transition-colors hover:bg-neutral-800 active:bg-neutral-700"
              disabled={isLoading}
            >
              {isLoading ? '생성 중...' : '앨범 만들기'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
