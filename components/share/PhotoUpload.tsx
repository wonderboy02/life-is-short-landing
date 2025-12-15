'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/validations/schemas';
import UploaderDialog from './UploaderDialog';

interface FileWithDescription {
  file: File;
  description: string;
  previewUrl: string;
}

interface PhotoUploadProps {
  groupId: string;
  token: string;
  onUploadSuccess?: () => void;
}

export default function PhotoUpload({
  groupId,
  token,
  onUploadSuccess,
}: PhotoUploadProps) {
  const [uploaderNickname, setUploaderNickname] = useState('');
  const [showNicknameDialog, setShowNicknameDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithDescription[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleNicknameConfirm = (nickname: string) => {
    setUploaderNickname(nickname);
    localStorage.setItem(nicknameKey, nickname);
    setShowNicknameDialog(false);
  };

  const handleChangeNickname = () => {
    setShowNicknameDialog(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // 파일 검증
    const validFiles = files.filter((file) => {
      if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
        toast.error(`${file.name}: JPG, PNG, WebP 형식만 지원합니다.`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: 파일 크기는 최대 10MB까지 가능합니다.`);
        return false;
      }
      return true;
    });

    const filesWithDescription = validFiles.map((file) => ({
      file,
      description: '',
      previewUrl: URL.createObjectURL(file), // 미리보기 URL 생성
    }));

    setSelectedFiles((prev) => [...prev, ...filesWithDescription]);

    // input 리셋 (같은 파일 다시 선택 가능하도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev[index];
      // 메모리 누수 방지: 미리보기 URL 해제
      URL.revokeObjectURL(fileToRemove.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDescriptionChange = (index: number, description: string) => {
    setSelectedFiles((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, description } : item
      )
    );
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('사진을 먼저 선택해주세요');
      return;
    }

    if (!uploaderNickname.trim()) {
      toast.error('닉네임을 설정해주세요');
      setShowNicknameDialog(true);
      return;
    }

    setIsUploading(true);
    let successCount = 0;

    try {
      // 각 파일 업로드
      for (const { file, description } of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('groupId', groupId);
        formData.append('uploaderNickname', uploaderNickname.trim());
        if (description.trim()) {
          formData.append('description', description.trim());
        }

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
            successCount++;
          } else {
            toast.error(`${file.name}: ${result.error}`);
          }
        } catch (error) {
          console.error(`${file.name} 업로드 오류:`, error);
          toast.error(`${file.name}: 업로드 실패`);
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount}개의 추억이 저장되었습니다 ✨`);
        setSelectedFiles([]);
        onUploadSuccess?.();
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold font-display text-neutral-900">
            소중한 순간 남기기
          </h2>
          <p className="text-base text-neutral-600 leading-relaxed">
            옛날 사진 속 잊혀진 이야기를 함께 나눠주세요
          </p>
          {uploaderNickname && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleChangeNickname}
              className="text-sm text-neutral-500 hover:text-neutral-700 -mt-1"
            >
              <Edit2 className="w-3 h-3 mr-1" />
              {uploaderNickname}
            </Button>
          )}
        </div>

        {/* 파일 선택 */}
        <div>
          <Label htmlFor="photo-upload" className="cursor-pointer">
            <div className="relative bg-gradient-to-br from-neutral-50 to-neutral-100/50 border-2 border-dashed border-neutral-300 rounded-2xl p-12 text-center hover:border-neutral-400 hover:from-neutral-100/80 hover:to-neutral-50 transition-all duration-300 group">
              <div className="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/[0.02] rounded-2xl transition-colors duration-300" />
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
                  <Upload className="w-8 h-8 text-neutral-600" />
                </div>
                <p className="text-lg font-medium text-neutral-800 mb-2">
                  여기를 눌러 사진을 선택하세요
                </p>
                <p className="text-sm text-neutral-500">
                  JPG, PNG, WebP · 최대 10MB
                </p>
              </div>
            </div>
          </Label>
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
        </div>

        {/* 선택된 파일 미리보기 */}
        {selectedFiles.length > 0 && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-lg font-semibold text-neutral-800">
                {selectedFiles.length}개의 추억을 준비했어요
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                사진마다 이야기를 남겨보세요
              </p>
            </div>

            <div className="max-h-[600px] overflow-y-auto space-y-4 px-1">
              {selectedFiles.map((item, index) => (
                <div
                  key={`${item.file.name}-${index}`}
                  className="bg-white rounded-xl overflow-hidden border border-neutral-200 hover:border-neutral-300 transition-colors"
                >
                  {/* 이미지 미리보기 + 삭제 버튼 */}
                  <div className="relative aspect-video bg-neutral-100">
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-full h-full object-contain"
                    />
                    <button
                      onClick={() => handleRemoveFile(index)}
                      disabled={isUploading}
                      className="absolute top-3 right-3 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm disabled:opacity-50"
                      aria-label="사진 제거"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* 사진 설명 입력 */}
                  <div className="p-4">
                    <Textarea
                      placeholder="이 사진의 이야기를 들려주세요... (선택)"
                      value={item.description}
                      onChange={(e) =>
                        handleDescriptionChange(index, e.target.value)
                      }
                      disabled={isUploading}
                      className="text-sm resize-none border-neutral-200 focus:border-neutral-400 rounded-lg"
                      rows={2}
                      maxLength={200}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-neutral-400 truncate flex-1">
                        {item.file.name}
                      </p>
                      {item.description && (
                        <p className="text-xs text-neutral-400 ml-2">
                          {item.description.length}/200
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 업로드 버튼 */}
        {selectedFiles.length > 0 && (
          <Button
            onClick={handleUpload}
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
      />
    </>
  );
}
