'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/validations/schemas';

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploaderNickname, setUploaderNickname] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: boolean;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    setSelectedFiles((prev) => [...prev, ...validFiles]);

    // input 리셋 (같은 파일 다시 선택 가능하도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('업로드할 사진을 선택해주세요.');
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    const progressMap: { [key: string]: boolean } = {};

    try {
      // 각 파일 업로드
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('groupId', groupId);
        if (uploaderNickname.trim()) {
          formData.append('uploaderNickname', uploaderNickname.trim());
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
            progressMap[file.name] = true;
            setUploadProgress({ ...progressMap });
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
        setUploadProgress({});
        onUploadSuccess?.();
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 font-display">사진 업로드</h3>

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

        {/* 선택된 파일 목록 */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              선택된 파일 ({selectedFiles.length}개)
            </Label>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between bg-neutral-50 rounded-lg p-2"
                >
                  <span className="text-sm text-neutral-700 truncate flex-1">
                    {file.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                    disabled={isUploading}
                    className="ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 업로더 닉네임 (선택사항) */}
        <div>
          <Label htmlFor="uploader-nickname" className="text-sm">
            닉네임 (선택사항)
          </Label>
          <Input
            id="uploader-nickname"
            type="text"
            placeholder="예: 엄마, 아빠"
            value={uploaderNickname}
            onChange={(e) => setUploaderNickname(e.target.value)}
            disabled={isUploading}
            className="mt-1"
            maxLength={50}
          />
        </div>

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
  );
}
