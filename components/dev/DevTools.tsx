'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, X, Trash2, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface DevToolsProps {
  onShowFirstVisitModal?: () => void;
  testMode?: boolean;
  onTestModeChange?: (enabled: boolean) => void;
  onTestPhotoCountChange?: (count: number) => void;
  onTestTimeOffsetChange?: (offset: number) => void;
}

export default function DevTools({
  onShowFirstVisitModal,
  testMode,
  onTestModeChange,
  onTestPhotoCountChange,
  onTestTimeOffsetChange,
}: DevToolsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Production 환경에서는 렌더링하지 않음
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const clearAllLocalStorage = () => {
    const count = localStorage.length;
    localStorage.clear();
    toast.success(`localStorage 전체 삭제됨 (${count}개 항목)`);
    console.log(`[Dev] localStorage 전체 삭제됨 (${count}개 항목)`);
  };

  const clearServiceIntro = () => {
    const keys = Object.keys(localStorage);
    const matchedKeys = keys.filter((key) => key.includes('service-intro-visited'));
    matchedKeys.forEach((key) => localStorage.removeItem(key));
    toast.success(`서비스 소개 모달 초기화 (${matchedKeys.length}개)`);
    console.log(`[Dev] 서비스 소개 모달 초기화: ${matchedKeys.join(', ')}`);
  };

  const clearUploaderNickname = () => {
    const keys = Object.keys(localStorage);
    const matchedKeys = keys.filter((key) => key.includes('photo-uploader-nickname'));
    matchedKeys.forEach((key) => localStorage.removeItem(key));
    toast.success(`업로더 닉네임 초기화 (${matchedKeys.length}개)`);
    console.log(`[Dev] 업로더 닉네임 초기화: ${matchedKeys.join(', ')}`);
  };

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 active:scale-95 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          title="개발 도구 열기"
        >
          <Settings className="w-6 h-6 animate-spin" style={{ animationDuration: '3s' }} />
        </button>
      )}

      {/* 개발 도구 패널 */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
          {/* 헤더 */}
          <div className="bg-purple-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              <span className="font-semibold">개발 도구</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-purple-700 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 내용 */}
          <div className="p-4 space-y-3">
            <div className="text-xs text-neutral-500 mb-3">
              개발 환경 전용 (Production에서는 숨김)
            </div>

            {/* 서비스 소개 모달 초기화 */}
            <div className="space-y-1">
              <Button
                onClick={clearServiceIntro}
                variant="outline"
                className="w-full justify-start gap-2 h-10 active:scale-95 transition-transform"
              >
                <Trash2 className="w-4 h-4" />
                서비스 소개 모달 초기화
              </Button>
              <p className="text-xs text-neutral-500 pl-2">
                첫 방문 시 표시되는 영상 모달을 다시 볼 수 있어요
              </p>
            </div>

            {/* 첫 방문 안내 모달 테스트 */}
            {onShowFirstVisitModal && (
              <div className="space-y-1">
                <Button
                  onClick={() => {
                    onShowFirstVisitModal();
                    toast.success('첫 방문 안내 모달 표시');
                  }}
                  variant="outline"
                  className="w-full justify-start gap-2 h-10 bg-blue-50 hover:bg-blue-100 active:scale-95 transition-transform"
                >
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-600">첫 방문 안내 모달 보기</span>
                </Button>
                <p className="text-xs text-neutral-500 pl-2">
                  앨범 생성 후 표시되는 안내 모달을 테스트해요
                </p>
              </div>
            )}

            {/* 상태 테스트 모드 */}
            {onTestModeChange && onTestPhotoCountChange && onTestTimeOffsetChange && (
              <div className="border-t border-neutral-200 pt-3 mt-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-neutral-700">상태 테스트</p>
                    <Button
                      onClick={() => onTestModeChange(!testMode)}
                      variant={testMode ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs"
                    >
                      {testMode ? 'ON' : 'OFF'}
                    </Button>
                  </div>

                  {testMode && (
                    <div className="space-y-2">
                      {/* 상태 1: 시간 O + 사진 부족 */}
                      <Button
                        onClick={() => {
                          onTestPhotoCountChange(5);
                          onTestTimeOffsetChange(0);
                          toast.success('상태 1: 시간 남음 + 사진 부족');
                        }}
                        variant="outline"
                        className="w-full justify-start h-8 text-xs"
                      >
                        1️⃣ 시간 O + 사진 부족
                      </Button>

                      {/* 상태 2: 시간 O + 사진 0장 */}
                      <Button
                        onClick={() => {
                          onTestPhotoCountChange(0);
                          onTestTimeOffsetChange(0);
                          toast.success('상태 2: 시간 남음 + 사진 0장');
                        }}
                        variant="outline"
                        className="w-full justify-start h-8 text-xs"
                      >
                        2️⃣ 시간 O + 사진 0장
                      </Button>

                      {/* 상태 3: 시간 O + 사진 충분 */}
                      <Button
                        onClick={() => {
                          onTestPhotoCountChange(15);
                          onTestTimeOffsetChange(0);
                          toast.success('상태 3: 시간 남음 + 사진 충분');
                        }}
                        variant="outline"
                        className="w-full justify-start h-8 text-xs"
                      >
                        3️⃣ 시간 O + 사진 충분
                      </Button>

                      {/* 상태 4: 시간 X + 사진 충분 */}
                      <Button
                        onClick={() => {
                          onTestPhotoCountChange(15);
                          onTestTimeOffsetChange(-80); // -80시간 (3일 넘김)
                          toast.success('상태 4: 시간 마감 + 사진 충분');
                        }}
                        variant="outline"
                        className="w-full justify-start h-8 text-xs"
                      >
                        4️⃣ 시간 X + 사진 충분
                      </Button>

                      {/* 상태 5: 시간 X + 사진 부족 */}
                      <Button
                        onClick={() => {
                          onTestPhotoCountChange(5);
                          onTestTimeOffsetChange(-80); // -80시간 (3일 넘김)
                          toast.success('상태 5: 시간 마감 + 사진 부족');
                        }}
                        variant="outline"
                        className="w-full justify-start h-8 text-xs"
                      >
                        5️⃣ 시간 X + 사진 부족
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 업로더 닉네임 초기화 */}
            <div className="space-y-1">
              <Button
                onClick={clearUploaderNickname}
                variant="outline"
                className="w-full justify-start gap-2 h-10 active:scale-95 transition-transform"
              >
                <Trash2 className="w-4 h-4" />
                업로더 닉네임 초기화
              </Button>
              <p className="text-xs text-neutral-500 pl-2">
                저장된 업로더 닉네임을 삭제하고 다시 입력받아요
              </p>
            </div>

            {/* localStorage 전체 삭제 */}
            <div className="space-y-1">
              <Button
                onClick={clearAllLocalStorage}
                variant="outline"
                className="w-full justify-start gap-2 h-10 text-red-600 hover:text-red-700 hover:bg-red-50 active:scale-95 transition-transform"
              >
                <Trash2 className="w-4 h-4" />
                localStorage 전체 삭제
              </Button>
              <p className="text-xs text-neutral-500 pl-2">
                모든 로컬 데이터를 삭제해요 (주의!)
              </p>
            </div>

            {/* 페이지 새로고침 */}
            <div className="border-t border-neutral-200 pt-3 mt-3">
              <Button
                onClick={reloadPage}
                variant="outline"
                className="w-full justify-start gap-2 h-10 active:scale-95 transition-transform"
              >
                <RefreshCw className="w-4 h-4" />
                페이지 새로고침
              </Button>
            </div>

            <div className="text-xs text-neutral-400 pt-2">
              localStorage 항목: {localStorage.length}개
            </div>
          </div>
        </div>
      )}
    </>
  );
}
