'use client';

import { useState, useEffect } from 'react';
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
import { X, User, MessageCircle, Lock, Phone } from 'lucide-react';
import Image from 'next/image';

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
    mode: 'onBlur', // 필드를 벗어날 때 검증
  });

  const handleSuggestedComment = (comment: string) => {
    setValue('comment', comment, { shouldValidate: true });
  };

  // 에러 발생 시 첫 번째 에러 필드로 스크롤
  useEffect(() => {
    const firstErrorKey = Object.keys(errors)[0] as keyof FormData | undefined;
    if (firstErrorKey) {
      const errorElement = document.getElementById(firstErrorKey);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
    }
  }, [errors]);

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
        <div className="relative bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50 px-6 pt-6 pb-4">
          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 rounded-full p-1.5 transition-colors hover:bg-neutral-200/50"
            aria-label="닫기"
          >
            <X className="h-5 w-5 text-neutral-600" />
          </button>

          {/* Logo */}
          <div className="mb-3 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg">
              <Image
                src="/favicon/logo.png"
                alt="Life is Short Logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
            </div>
          </div>

          {/* Header Text */}
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="font-display text-center text-xl font-bold">
              그때 그 시절 앨범 만들기
            </DialogTitle>
            <DialogDescription className="text-center text-sm">
              부모님의 청춘, 가족의 잊혀진 순간들을 모아보세요
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Form Area */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {/* 생성자 닉네임 */}
            <div className="space-y-1.5">
              <Label htmlFor="creatorNickname" className="flex items-center gap-1.5 text-sm font-medium">
                <User className="h-3.5 w-3.5 text-neutral-600" />
                앨범 주인
              </Label>
              <Input
                id="creatorNickname"
                type="text"
                placeholder="예: 큰아들"
                className={`h-11 text-sm transition-colors ${
                  errors.creatorNickname
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-neutral-200 focus:border-neutral-400'
                }`}
                {...register('creatorNickname')}
                disabled={isLoading}
              />
              {errors.creatorNickname && (
                <p className="text-xs text-red-600">{errors.creatorNickname.message}</p>
              )}
            </div>

            {/* 가족들에게 한마디 */}
            <div className="space-y-1.5">
              <Label htmlFor="comment" className="flex items-center gap-1.5 text-sm font-medium">
                <MessageCircle className="h-3.5 w-3.5 text-neutral-600" />
                가족들에게 한마디
              </Label>
              <Textarea
                id="comment"
                placeholder="예: 아버지, 청춘의 모습이 궁금해요"
                className={`min-h-[72px] resize-none text-sm transition-colors ${
                  errors.comment
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-neutral-200 focus:border-neutral-400'
                }`}
                {...register('comment')}
                disabled={isLoading}
              />
              {errors.comment && <p className="text-xs text-red-600">{errors.comment.message}</p>}

              {/* 추천 문구 칩들 */}
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_COMMENTS.map((comment, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestedComment(comment)}
                    disabled={isLoading}
                    className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-50"
                  >
                    {comment}
                  </button>
                ))}
              </div>

              <p className="text-xs text-neutral-500">
                가족과 함께 사진을 모을 때 이 문구가 표시됩니다
              </p>
            </div>

            {/* 연락처 */}
            <div className="space-y-1.5">
              <Label htmlFor="contact" className="flex items-center gap-1.5 text-sm font-medium">
                <Phone className="h-3.5 w-3.5 text-neutral-600" />
                영상 수령 연락처
              </Label>
              <Input
                id="contact"
                type="text"
                placeholder="전화번호 또는 카카오톡 ID"
                className={`h-11 text-sm transition-colors ${
                  errors.contact
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-neutral-200 focus:border-neutral-400'
                }`}
                {...register('contact')}
                disabled={isLoading}
              />
              {errors.contact && (
                <p className="text-xs text-red-600">{errors.contact.message}</p>
              )}
              <p className="text-xs text-neutral-500">
                영상 전달 용도로만 사용되며, 전달 후 즉시 폐기됩니다
              </p>
            </div>

            {/* 비밀번호 */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="flex items-center gap-1.5 text-sm font-medium">
                <Lock className="h-3.5 w-3.5 text-neutral-600" />
                비밀번호
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="최소 6자"
                className={`h-11 text-sm transition-colors ${
                  errors.password
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-neutral-200 focus:border-neutral-400'
                }`}
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
              <p className="text-xs text-neutral-500">
                사진 삭제 시 필요합니다
              </p>
            </div>
          </div>

          {/* Sticky Bottom Button */}
          <div className="sticky bottom-0 border-t border-neutral-100 bg-white px-6 py-3.5 shadow-lg">
            <Button
              type="submit"
              className="h-11 w-full rounded-xl bg-neutral-900 text-sm font-medium transition-colors hover:bg-neutral-800 active:bg-neutral-700"
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
