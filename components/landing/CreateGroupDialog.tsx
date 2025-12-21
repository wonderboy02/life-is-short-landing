'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Checkbox } from '@/components/ui/checkbox';
import { createGroupSchema } from '@/lib/validations/schemas';
import { toast } from 'sonner';
import { X, User, MessageCircle, Lock, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

type FormData = z.infer<typeof createGroupSchema>;

const SUGGESTED_COMMENTS = [
  '아빠 엄마 젊었을 때 사진 보고 싶어요',
  '우리 가족 옛날 사진 모아봐요',
  '할머니 할아버지 젊은 시절이 궁금해요',
];

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    trigger,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(createGroupSchema),
    mode: 'onChange',
  });

  const handleSuggestedComment = (comment: string) => {
    setValue('comment', comment, { shouldValidate: true });
  };

  // 다음 단계로 이동
  const handleNext = async () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = await trigger('creatorNickname');
    } else if (currentStep === 2) {
      isValid = await trigger('comment');
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // 이전 단계로 이동
  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // 모달이 닫힐 때 초기화
  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
      setPrivacyConsent(false);
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: FormData) => {
    if (!privacyConsent) {
      toast.error('개인정보 수집 및 이용에 동의해주세요.');
      return;
    }

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

  // 슬라이드 애니메이션 variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex h-[85vh] max-h-[700px] w-full max-w-none flex-col overflow-hidden rounded-none p-0 sm:max-w-md sm:rounded-lg"
          showCloseButton={false}
        >
          {/* Header */}
          <div className="relative border-b border-neutral-100 bg-white px-4 pt-4 pb-2">
            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-3 right-3 rounded-full p-1.5 transition-colors hover:bg-neutral-100"
              aria-label="닫기"
            >
              <X className="h-5 w-5 text-neutral-600" />
            </button>

            {/* Logo */}
            <div className="mb-2 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-50">
                <Image
                  src="/favicon/logo.png"
                  alt="Life is Short Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
              </div>
            </div>

            <DialogHeader className="space-y-1">
              <DialogTitle className="text-center text-lg font-bold">
                그때 그 시절 앨범 만들기
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Form Area */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
            <div className="relative flex-1 overflow-hidden">
              <AnimatePresence mode="wait" custom={currentStep}>
                {/* Step 1: 앨범 주인 */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    custom={currentStep}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex flex-col px-6 pt-2 pb-6"
                  >
                    {/* Preview Image with Caption */}
                    <div className="mb-6 flex flex-col items-center gap-2">
                      <p className="text-xs font-medium text-neutral-600">
                        작성해주신 닉네임은 이렇게 가족에게 보여집니다!
                      </p>
                      <div className="overflow-hidden rounded-xl border border-neutral-200 shadow-sm">
                        <Image
                          src="/create_group_example.png"
                          alt="가족들이 보게 될 화면 미리보기"
                          width={200}
                          height={200}
                          className="h-auto w-48"
                        />
                      </div>
                    </div>

                    {/* 입력 필드 */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="creatorNickname"
                        className="flex items-center gap-1.5 text-sm font-medium"
                      >
                        <User className="h-4 w-4 text-neutral-600" />
                        앨범 주인
                      </Label>
                      <Input
                        id="creatorNickname"
                        type="text"
                        placeholder="예: 김태양"
                        className={`h-12 text-base ${
                          errors.creatorNickname
                            ? 'border-red-500 focus:border-red-600'
                            : 'border-neutral-200'
                        }`}
                        {...register('creatorNickname')}
                        disabled={isLoading}
                      />
                      {errors.creatorNickname && (
                        <p className="text-xs text-red-600">{errors.creatorNickname.message}</p>
                      )}
                      <p className="text-xs text-neutral-500">앨범을 만드는 당신은 누구신가요?</p>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: 가족들에게 부탁 메시지 */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    custom={currentStep}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex flex-col overflow-y-auto px-6 pt-2 pb-6"
                  >
                    {/* Preview Image with Caption */}
                    <div className="mb-6 flex flex-col items-center gap-2">
                      <p className="text-xs font-medium text-neutral-600">
                        가족들이 보게 될 화면이에요
                      </p>
                      <div className="overflow-hidden rounded-xl border border-neutral-200 shadow-sm">
                        <Image
                          src="/create_group_example.png"
                          alt="가족들이 보게 될 화면 미리보기"
                          width={200}
                          height={200}
                          className="h-auto w-48"
                        />
                      </div>
                    </div>

                    {/* 입력 필드 */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="comment"
                        className="flex items-center gap-1.5 text-sm font-medium"
                      >
                        <MessageCircle className="h-4 w-4 text-neutral-600" />
                        가족들에게 부탁 메시지
                      </Label>
                      <Input
                        id="comment"
                        type="text"
                        placeholder="예: 아빠 엄마 젊었을 때 사진 보고 싶어요"
                        className={`h-12 text-sm ${
                          errors.comment
                            ? 'border-red-500 focus:border-red-600'
                            : 'border-neutral-200'
                        }`}
                        {...register('comment')}
                        disabled={isLoading}
                      />
                      {errors.comment && (
                        <p className="text-xs text-red-600">{errors.comment.message}</p>
                      )}

                      <p className="text-xs text-neutral-500">
                        앨범 링크를 받은 가족들이 가장 먼저 보게 됩니다
                      </p>

                      {/* 추천 문구 */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {SUGGESTED_COMMENTS.map((comment, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestedComment(comment)}
                            disabled={isLoading}
                            className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-50"
                          >
                            {comment}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: 연락처 + 비밀번호 + 개인정보 동의 */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    custom={currentStep}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex flex-col overflow-y-auto px-6 py-6"
                  >
                    <div className="space-y-4">
                      {/* 연락처 */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="contact"
                          className="flex items-center gap-1.5 text-sm font-medium"
                        >
                          <Phone className="h-4 w-4 text-neutral-600" />
                          영상 수령 연락처
                        </Label>
                        <Input
                          id="contact"
                          type="text"
                          placeholder="전화번호 또는 카카오톡 ID"
                          className={`h-12 text-base ${
                            errors.contact
                              ? 'border-red-500 focus:border-red-600'
                              : 'border-neutral-200'
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
                      <div className="space-y-2">
                        <Label
                          htmlFor="password"
                          className="flex items-center gap-1.5 text-sm font-medium"
                        >
                          <Lock className="h-4 w-4 text-neutral-600" />
                          비밀번호
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="최소 6자"
                          className={`h-12 text-base ${
                            errors.password
                              ? 'border-red-500 focus:border-red-600'
                              : 'border-neutral-200'
                          }`}
                          {...register('password')}
                          disabled={isLoading}
                        />
                        {errors.password && (
                          <p className="text-xs text-red-600">{errors.password.message}</p>
                        )}
                        <p className="text-xs text-neutral-500">사진 삭제 시 필요합니다</p>
                      </div>

                      {/* 개인정보 동의 */}
                      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id="privacy-consent"
                            checked={privacyConsent}
                            onCheckedChange={(checked) => setPrivacyConsent(checked as boolean)}
                            disabled={isLoading}
                          />
                          <div className="flex-1">
                            <label
                              htmlFor="privacy-consent"
                              className="cursor-pointer text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              개인정보 수집 및 이용에 동의합니다 (필수)
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowPrivacyDialog(true)}
                              className="mt-1 ml-1 text-xs text-neutral-600 underline hover:text-neutral-900"
                            >
                              상세보기
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Buttons */}
            <div className="border-t border-neutral-100 bg-white px-6 py-4">
              {currentStep < 3 ? (
                <div className="flex gap-3">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      onClick={handlePrev}
                      variant="outline"
                      className="h-12 flex-1"
                      disabled={isLoading}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      이전
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={handleNext}
                    className={`h-12 bg-neutral-900 hover:bg-neutral-800 ${currentStep === 1 ? 'w-full' : 'flex-1'}`}
                    disabled={isLoading}
                  >
                    다음
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={handlePrev}
                    variant="outline"
                    className="h-12 flex-1"
                    disabled={isLoading}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    이전
                  </Button>
                  <Button
                    type="submit"
                    className="h-12 flex-1 bg-neutral-900 hover:bg-neutral-800"
                    disabled={isLoading || !privacyConsent}
                  >
                    {isLoading ? '생성 중...' : '앨범 만들기'}
                  </Button>
                </div>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 개인정보 처리방침 다이얼로그 */}
      <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>개인정보 수집 및 이용 동의</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] space-y-4 overflow-y-auto text-sm">
            <div>
              <h3 className="mb-2 font-semibold text-neutral-900">
                1. 개인정보의 수집 및 이용 목적
              </h3>
              <p className="text-neutral-600">
                (주)태뚜는 다음의 목적을 위하여 개인정보를 처리합니다. 처리한 개인정보는 다음의 목적
                이외의 용도로는 사용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법
                제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <ul className="mt-2 list-disc pl-5 text-neutral-600">
                <li>가족 추억 앨범 생성 및 관리</li>
                <li>완성된 영상 전달을 위한 연락</li>
                <li>본인 확인 및 부정 이용 방지</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-neutral-900">2. 수집하는 개인정보 항목</h3>
              <ul className="list-disc pl-5 text-neutral-600">
                <li>
                  필수항목: 앨범 주인 닉네임, 가족 부탁 메시지, 연락처(전화번호 또는 카카오톡 ID),
                  비밀번호
                </li>
                <li>자동수집항목: 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-neutral-900">
                3. 개인정보의 보유 및 이용 기간
              </h3>
              <p className="text-neutral-600">
                수집된 개인정보는 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이
                파기합니다.
              </p>
              <ul className="mt-2 list-disc pl-5 text-neutral-600">
                <li>앨범 주인 닉네임, 부탁 메시지: 앨범 삭제 시까지</li>
                <li>연락처: 영상 전달 완료 후 즉시 파기</li>
                <li>비밀번호: 앨범 삭제 시까지 (암호화 보관)</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-neutral-900">
                4. 동의를 거부할 권리 및 불이익
              </h3>
              <p className="text-neutral-600">
                귀하는 개인정보 수집 및 이용 동의를 거부할 권리가 있습니다. 다만, 필수항목에 대한
                동의를 거부하실 경우 서비스 이용이 제한될 수 있습니다.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-neutral-900">5. 개인정보 보호책임자</h3>
              <p className="text-neutral-600">
                개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의
                불만처리 및 피해구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>
              <div className="mt-2 text-neutral-600">
                <p>개인정보 보호책임자: (주)태뚜</p>
                <p>문의: 서비스 내 문의하기</p>
              </div>
            </div>

            <div className="rounded-lg bg-neutral-50 p-3">
              <p className="text-xs text-neutral-600">
                ※ (주)태뚜는 정보주체의 개인정보를 안전하게 관리하며, 개인정보보호법 등 관련 법령을
                준수합니다.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowPrivacyDialog(false)}>확인</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
