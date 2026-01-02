'use client';

import { useState, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/validations/schemas';
import UploaderDialog from '@/components/share/UploaderDialog';
import ImageViewerModal from '@/components/share/ImageViewerModal';
import KakaoChannelChatButton from '@/components/channel/KakaoChannelChatButton';

type UploadStatus = 'pending' | 'uploading' | 'success' | 'failed';

interface FileWithDescription {
  id: string;
  file: File;
  previewUrl: string;
  uploadStatus: UploadStatus;
  error?: string;
}

interface ButtonConfig {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

interface SharePageBottomBarProps {
  /**
   * 그룹 ID
   */
  groupId: string;
  /**
   * 인증 토큰
   */
  token: string;
  /**
   * 업로드 성공 시 호출되는 콜백 (refetch)
   */
  onRefetch?: () => void;
  /**
   * 첫 사진 업로드 성공 시 호출되는 콜백 (스크롤)
   */
  onPhotoUploaded?: () => void;
  /**
   * 보조 버튼 설정 (선택)
   */
  secondaryButton?: ButtonConfig;
  /**
   * 높이 변경 콜백 (px 단위)
   */
  onHeightChange?: (height: number) => void;
}

export default function SharePageBottomBar({
  groupId,
  token,
  onRefetch,
  onPhotoUploaded,
  secondaryButton,
  onHeightChange,
}: SharePageBottomBarProps) {
  // 상태 관리
  const [selectedFiles, setSelectedFiles] = useState<FileWithDescription[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploaderNickname, setUploaderNickname] = useState('');
  const [showNicknameDialog, setShowNicknameDialog] = useState(false);
  const [isPendingUpload, setIsPendingUpload] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstSuccessTriggeredRef = useRef(false);

  // 그룹별 localStorage 키
  const nicknameKey = `photo-uploader-nickname-${groupId}`;

  // 닉네임 불러오기 (그룹별 localStorage)
  useEffect(() => {
    const savedNickname = localStorage.getItem(nicknameKey);
    if (savedNickname) {
      setUploaderNickname(savedNickname);
    }
  }, [nicknameKey]);

  // cleanup: 컴포넌트 언마운트 시 미리보기 URL 해제
  useEffect(() => {
    return () => {
      selectedFiles.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [selectedFiles]);

  // ResizeObserver: 높이 변화 감지
  useEffect(() => {
    if (!containerRef.current || !onHeightChange) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.target.getBoundingClientRect().height;
        onHeightChange(height);
      }
    });

    resizeObserver.observe(containerRef.current);

    // 초기 높이 측정
    const initialHeight = containerRef.current.getBoundingClientRect().height;
    onHeightChange(initialHeight);

    return () => {
      resizeObserver.disconnect();
    };
  }, [onHeightChange]);

  const handleNicknameConfirm = (nickname: string) => {
    setUploaderNickname(nickname);
    localStorage.setItem(nicknameKey, nickname);
    setShowNicknameDialog(false);

    // 업로드 버튼을 눌러서 다이얼로그가 뜬 경우에만 자동 업로드
    if (isPendingUpload) {
      setIsPendingUpload(false);
      handleUpload(nickname);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('📸 선택된 파일 개수:', files.length);
    console.log('📸 파일 목록:', files.map((f) => f.name));

    // 파일 검증
    const validFiles = files.filter((file) => {
      console.log(`🔍 파일: ${file.name}`);
      console.log(`   - MIME 타입: ${file.type}`);
      console.log(`   - 크기: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

      if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
        console.log(`   ❌ MIME 타입 불일치! (허용: ${ALLOWED_MIME_TYPES.join(', ')})`);
        toast.error(`${file.name}: JPG, PNG, WebP 형식만 지원합니다.`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        console.log(`   ❌ 파일 크기 초과! (최대: ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
        toast.error(`${file.name}: 파일 크기는 최대 20MB까지 가능합니다.`);
        return false;
      }
      console.log(`   ✅ 검증 통과`);
      return true;
    });

    const filesWithDescription = validFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      uploadStatus: 'pending' as UploadStatus,
    }));

    console.log('✅ 검증 통과한 파일 개수:', validFiles.length);
    console.log('🎯 추가할 파일 개수:', filesWithDescription.length);

    setSelectedFiles((prev) => {
      console.log('📦 기존 파일 개수:', prev.length);
      console.log('📦 새로운 총 파일 개수:', prev.length + filesWithDescription.length);
      return [...prev, ...filesWithDescription];
    });

    // input 리셋 (같은 파일 다시 선택 가능하도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) {
        // 메모리 누수 방지: 미리보기 URL 해제
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleUpload = async (providedNickname?: string) => {
    if (selectedFiles.length === 0) {
      toast.error('사진을 먼저 선택해주세요');
      return;
    }

    const nickname = providedNickname || uploaderNickname;

    if (!nickname.trim()) {
      toast.error('닉네임을 설정해주세요');
      setIsPendingUpload(true);
      setShowNicknameDialog(true);
      return;
    }

    // flushSync: 상태 업데이트를 즉시 DOM에 반영
    flushSync(() => {
      setIsUploading(true);
      setSelectedFiles((prev) =>
        prev.map((f) => ({ ...f, uploadStatus: 'uploading' as UploadStatus }))
      );
    });

    // 업로드 시작 시 ref 초기화
    firstSuccessTriggeredRef.current = false;

    try {
      // 병렬 업로드 - 각 파일을 동시에 처리
      const uploadPromises = selectedFiles.map(async (item) => {
        const { id, file } = item;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('groupId', groupId);
        formData.append('uploaderNickname', nickname.trim());

        try {
          const response = await fetch('/api/photos/upload', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          const result = await response.json();

          if (result.success) {
            // 성공 상태로 변경
            setSelectedFiles((prev) =>
              prev.map((f) =>
                f.id === id ? { ...f, uploadStatus: 'success' as UploadStatus } : f
              )
            );

            // 첫 번째 성공 시 콜백 호출 (스크롤 + refetch)
            if (!firstSuccessTriggeredRef.current) {
              firstSuccessTriggeredRef.current = true;
              onPhotoUploaded?.();
            }

            return { success: true, fileName: file.name };
          } else {
            // 실패 상태로 변경
            setSelectedFiles((prev) =>
              prev.map((f) =>
                f.id === id
                  ? { ...f, uploadStatus: 'failed' as UploadStatus, error: result.error }
                  : f
              )
            );
            return { success: false, fileName: file.name, error: result.error };
          }
        } catch (error) {
          console.error(`${file.name} 업로드 오류:`, error);
          // 실패 상태로 변경
          setSelectedFiles((prev) =>
            prev.map((f) =>
              f.id === id
                ? { ...f, uploadStatus: 'failed' as UploadStatus, error: '업로드 실패' }
                : f
            )
          );
          return { success: false, fileName: file.name, error: '업로드 실패' };
        }
      });

      // 모든 업로드 완료 대기
      const results = await Promise.allSettled(uploadPromises);

      // 결과 집계
      const successCount = results.filter(
        (r) => r.status === 'fulfilled' && r.value.success
      ).length;

      const failedResults = results
        .filter((r) => r.status === 'fulfilled' && !r.value.success)
        .map((r) => (r.status === 'fulfilled' ? r.value : null));

      // 실패한 항목 토스트 표시
      failedResults.forEach((result) => {
        if (result) {
          const errorMsg = result.error?.trim() || '업로드 실패';
          toast.error(`${result.fileName}: ${errorMsg}`);
        }
      });

      if (successCount > 0) {
        toast.success(`${successCount}개의 추억이 저장되었습니다 ✨`);

        // 성공한 파일만 목록에서 제거
        setSelectedFiles((prev) => {
          // 성공한 파일 cleanup
          prev
            .filter((f) => f.uploadStatus === 'success')
            .forEach((f) => {
              URL.revokeObjectURL(f.previewUrl);
            });
          return prev.filter((f) => f.uploadStatus !== 'success');
        });

        // 최종 refetch
        onRefetch?.();
      }

      if (successCount === 0 && failedResults.length > 0) {
        toast.error('모든 사진 업로드에 실패했습니다');
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Primary 버튼 동작
  const handlePrimaryClick = () => {
    if (selectedFiles.length > 0) {
      handleUpload();
    } else {
      fileInputRef.current?.click();
    }
  };

  const primaryButtonText = selectedFiles.length > 0
    ? `${selectedFiles.length}개 추억 저장하기`
    : '사진 추가하기';

  return (
    <>
      {/* Hidden file input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_MIME_TYPES.join(',')}
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      <div
        ref={containerRef}
        className="fixed bottom-0 left-1/2 z-50 w-[min(428px,100vw)] -translate-x-1/2 border-t border-neutral-200 bg-white/80 backdrop-blur-sm"
      >
        {/* 섬네일 스크롤 영역 (조건부 렌더링) */}
        {selectedFiles.length > 0 && (
          <div className="relative border-b border-neutral-200">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2 bg-neutral-50">
              {selectedFiles.map((item, index) => (
                <div
                  key={item.id}
                  className="relative flex-shrink-0 w-12 h-12"
                >
                  {/* 섬네일 이미지 */}
                  <div
                    className="relative w-full h-full rounded-lg overflow-hidden border border-neutral-200 cursor-pointer"
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-full h-full object-cover"
                    />

                    {/* 상태 표시 */}
                    {item.uploadStatus === 'uploading' && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      </div>
                    )}
                    {item.uploadStatus === 'success' && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-tl-lg flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {item.uploadStatus === 'failed' && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <XCircle className="w-4 h-4 text-red-600" />
                      </div>
                    )}
                  </div>

                  {/* 삭제 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(item.id);
                    }}
                    disabled={isUploading}
                    className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center disabled:opacity-50 transition-colors shadow-md"
                    aria-label="삭제"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
            {/* 스크롤 힌트 gradient */}
            <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-neutral-50 to-transparent pointer-events-none" />
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="px-4 py-3">
          <div className="space-y-2">
            {secondaryButton ? (
              <>
                {/* Secondary 버튼이 있을 때: Primary는 전체 너비, Secondary와 카카오톡은 같은 줄 */}
                {/* Primary 버튼 */}
                <Button
                  onClick={handlePrimaryClick}
                  disabled={isUploading}
                  size="lg"
                  className="w-full h-12"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      추억을 저장하는 중...
                    </>
                  ) : (
                    primaryButtonText
                  )}
                </Button>

                {/* Secondary 버튼 행 - 카카오톡 + Secondary */}
                <div className="flex gap-2">
                  {/* 카카오톡 1:1 상담 버튼 */}
                  <KakaoChannelChatButton size="lg" className="h-12 w-12" />

                  {/* Secondary 버튼 */}
                  <Button
                    onClick={secondaryButton.onClick}
                    disabled={secondaryButton.disabled || isUploading}
                    size="lg"
                    variant={secondaryButton.disabled ? 'outline' : 'default'}
                    className="flex-1 h-12"
                  >
                    {secondaryButton.text}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Secondary 버튼이 없을 때: 카카오톡 + Primary */}
                <div className="flex gap-2">
                  {/* 카카오톡 1:1 상담 버튼 */}
                  <KakaoChannelChatButton size="lg" className="h-12 w-12" />

                  {/* Primary 버튼 */}
                  <Button
                    onClick={handlePrimaryClick}
                    disabled={isUploading}
                    size="lg"
                    className="flex-1 h-12"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        추억을 저장하는 중...
                      </>
                    ) : (
                      primaryButtonText
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Safe area padding for iOS */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>

      {/* 닉네임 설정 다이얼로그 */}
      <UploaderDialog
        open={showNicknameDialog}
        onConfirm={handleNicknameConfirm}
        onOpenChange={setShowNicknameDialog}
      />

      {/* 이미지 뷰어 모달 */}
      {selectedImageIndex !== null && (
        <ImageViewerModal
          images={selectedFiles.map((item) => ({
            url: item.previewUrl,
            alt: item.file.name,
          }))}
          initialIndex={selectedImageIndex}
          open={selectedImageIndex !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedImageIndex(null);
          }}
        />
      )}
    </>
  );
}
