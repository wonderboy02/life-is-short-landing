'use client';

import { useState, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/validations/schemas';
import UploaderDialog from './UploaderDialog';
import ImageViewerModal from './ImageViewerModal';

type UploadStatus = 'pending' | 'uploading' | 'success' | 'failed';

interface FileWithDescription {
  id: string; // 고유 ID
  file: File;
  previewUrl: string;
  uploadStatus: UploadStatus;
  error?: string;
}

interface PhotoUploadProps {
  groupId: string;
  token: string;
  onUploadSuccess?: () => void;
  onPhotoUploaded?: () => void; // 개별 사진 완료 시 호출
  onReady?: (triggerFileSelect: () => void) => void; // 파일 선택 트리거 함수 전달
}

export default function PhotoUpload({
  groupId,
  token,
  onUploadSuccess,
  onPhotoUploaded,
  onReady,
}: PhotoUploadProps) {
  const [uploaderNickname, setUploaderNickname] = useState('');
  const [showNicknameDialog, setShowNicknameDialog] = useState(false);
  const [isPendingUpload, setIsPendingUpload] = useState(false); // 업로드 대기 중인지 추적
  const [selectedFiles, setSelectedFiles] = useState<FileWithDescription[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
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
    // 닉네임이 없어도 바로 다이얼로그를 표시하지 않음
    // 사진 업로드 시도할 때 체크하여 표시함
  }, [nicknameKey]);

  // cleanup: 컴포넌트 언마운트 시 미리보기 URL 해제
  useEffect(() => {
    return () => {
      selectedFiles.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [selectedFiles]);

  // 파일 선택 트리거 함수를 부모에게 전달 (한 번만 실행)
  useEffect(() => {
    if (onReady) {
      onReady(() => {
        fileInputRef.current?.click();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    console.log('📸 파일 목록:', files.map(f => f.name));

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
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // 고유 ID 생성
      file,
      previewUrl: URL.createObjectURL(file), // 미리보기 URL 생성
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
      setIsPendingUpload(true); // 업로드 대기 중 플래그 설정
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
          toast.error(`${result.fileName}: ${result.error || '업로드 실패'}`);
        }
      });

      if (successCount > 0) {
        toast.success(`${successCount}개의 추억이 저장되었습니다 ✨`);

        // 성공한 파일만 목록에서 제거
        setSelectedFiles((prev) => prev.filter((f) => f.uploadStatus !== 'success'));

        // 최종 refetch
        onUploadSuccess?.();
      }

      if (successCount === 0 && failedResults.length > 0) {
        toast.error('모든 사진 업로드에 실패했습니다');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Hidden file input - 프로그래밍적으로만 트리거됨 (bottom bar 버튼 클릭 시) */}
      <Input
        id="photo-upload"
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_MIME_TYPES.join(',')}
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      <div className="space-y-8">

        {/* 선택된 파일 미리보기 */}
        {selectedFiles.length > 0 && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-lg font-semibold text-neutral-800">
                {selectedFiles.length}개의 추억을 준비했어요
              </p>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                {selectedFiles.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative bg-white rounded-lg overflow-hidden border border-neutral-200 hover:border-neutral-300 transition-colors aspect-square cursor-pointer"
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    {/* 이미지 미리보기 */}
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-full h-full object-cover pointer-events-none"
                    />

                    {/* 삭제 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(item.id);
                      }}
                      disabled={isUploading}
                      className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm disabled:opacity-50 shadow-md"
                      aria-label="삭제"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* 상태 뱃지 */}
                    <div className="absolute bottom-2 left-2 pointer-events-none">
                      {item.uploadStatus === 'uploading' && (
                        <div className="flex items-center gap-1 bg-blue-500/90 text-white text-[10px] font-medium px-2 py-1 rounded-full backdrop-blur-sm">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>업로드 중</span>
                        </div>
                      )}
                      {item.uploadStatus === 'success' && (
                        <div className="flex items-center gap-1 bg-green-500/90 text-white text-[10px] font-medium px-2 py-1 rounded-full backdrop-blur-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>완료</span>
                        </div>
                      )}
                      {item.uploadStatus === 'failed' && (
                        <div className="flex items-center gap-1 bg-red-500/90 text-white text-[10px] font-medium px-2 py-1 rounded-full backdrop-blur-sm">
                          <XCircle className="w-3 h-3" />
                          <span>실패</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 업로드 버튼 */}
        {selectedFiles.length > 0 && (
          <Button
            onClick={() => handleUpload()}
            disabled={isUploading}
            className="w-full bg-neutral-900 hover:bg-neutral-800 h-14 text-base font-semibold rounded-xl shadow-sm"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                추억을 저장하는 중...
              </>
            ) : (
              `${selectedFiles.length}개의 추억 저장하기`
            )}
          </Button>
        )}
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
