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
    } else {
      setShowNicknameDialog(true);
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
      toast.error('업로드할 사진을 선택해주세요.');
      return;
    }

    if (!uploaderNickname.trim()) {
      toast.error('닉네임을 설정해주세요.');
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
        toast.success(`${successCount}개의 사진이 업로드되었습니다!`);
        setSelectedFiles([]);
        onUploadSuccess?.();
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
        {/* 헤더: 닉네임 표시 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-display">사진 업로드</h3>
          {uploaderNickname && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleChangeNickname}
              className="text-sm text-neutral-600"
            >
              <Edit2 className="w-3 h-3 mr-1" />
              {uploaderNickname}
            </Button>
          )}
        </div>

        <div className="space-y-4">
        {/* 파일 선택 */}
        <div>
          <Label htmlFor="photo-upload" className="cursor-pointer">
            <div className="border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center hover:border-neutral-400 transition-colors">
              <Upload className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm text-neutral-600 mb-1">
                사진을 선택하거나 드래그하세요
              </p>
              <p className="text-xs text-neutral-500">
                JPG, PNG, WebP (최대 10MB)
              </p>
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
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              선택된 파일 ({selectedFiles.length}개)
            </Label>
            <div className="max-h-[600px] overflow-y-auto space-y-4">
              {selectedFiles.map((item, index) => (
                <div
                  key={`${item.file.name}-${index}`}
                  className="bg-neutral-50 rounded-lg p-3 space-y-3"
                >
                  {/* 이미지 미리보기 + 삭제 버튼 */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-200">
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-full h-full object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isUploading}
                      className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* 파일명 */}
                  <div className="text-sm text-neutral-600 truncate">
                    {item.file.name}
                  </div>

                  {/* 사진 설명 입력 */}
                  <div>
                    <Textarea
                      placeholder="사진 설명 (선택사항)"
                      value={item.description}
                      onChange={(e) =>
                        handleDescriptionChange(index, e.target.value)
                      }
                      disabled={isUploading}
                      className="text-sm resize-none"
                      rows={2}
                      maxLength={200}
                    />
                    {item.description && (
                      <p className="text-xs text-neutral-500 mt-1">
                        {item.description.length}/200
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 업로드 버튼 */}
        <Button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isUploading}
          className="w-full bg-neutral-900 hover:bg-neutral-800"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              업로드 중...
            </>
          ) : (
            `${selectedFiles.length}개 사진 업로드`
          )}
        </Button>
      </div>
    </div>

      {/* 닉네임 설정 다이얼로그 */}
      <UploaderDialog
        open={showNicknameDialog}
        onConfirm={handleNicknameConfirm}
      />
    </>
  );
}
