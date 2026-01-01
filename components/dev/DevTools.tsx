'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, X, Trash2, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface DevToolsProps {
  onShowFirstVisitModal?: () => void;
  testMode?: boolean;
  onTestModeChange?: (enabled: boolean) => void;
  onTestPhotoCountChange?: (count: number) => void;
  onTestTimeOffsetChange?: (offset: number) => void;
  onTestVideoStatusChange?: (status: 'pending' | 'requested' | 'processing' | 'completed' | 'failed' | null) => void;
  // FixedBottomBar 상태 표시용
  currentPhotoCount?: number;
  currentVideoStatus?: 'pending' | 'requested' | 'processing' | 'completed' | 'failed' | null;
  hasTimeLeft?: boolean;
  timeLeft?: { days: number; hours: number; minutes: number };
  secondaryButtonText?: string;
  secondaryButtonDisabled?: boolean;
}

export default function DevTools({
  onShowFirstVisitModal,
  testMode,
  onTestModeChange,
  onTestPhotoCountChange,
  onTestTimeOffsetChange,
  onTestVideoStatusChange,
  currentPhotoCount,
  currentVideoStatus,
  hasTimeLeft,
  timeLeft,
  secondaryButtonText,
  secondaryButtonDisabled,
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
  };

  const clearServiceIntro = () => {
    const keys = Object.keys(localStorage);
    const matchedKeys = keys.filter((key) => key.includes('service-intro-visited'));
    matchedKeys.forEach((key) => localStorage.removeItem(key));
    toast.success(`서비스 소개 모달 초기화 (${matchedKeys.length}개)`);
  };

  const clearUploaderNickname = () => {
    const keys = Object.keys(localStorage);
    const matchedKeys = keys.filter((key) => key.includes('photo-uploader-nickname'));
    matchedKeys.forEach((key) => localStorage.removeItem(key));
    toast.success(`업로더 닉네임 초기화 (${matchedKeys.length}개)`);
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
          className="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 active:scale-95 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          title="개발 도구 열기"
        >
          <Settings className="w-6 h-6 animate-spin" style={{ animationDuration: '3s' }} />
        </button>
      )}

      {/* 개발 도구 패널 */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] w-80 bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
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
          <div className="p-4 space-y-3 max-h-[80vh] overflow-y-auto">
            <div className="text-xs text-neutral-500 mb-3">
              개발 환경 전용 (Production에서는 숨김)
            </div>

            {/* FixedBottomBar 현재 상태 표시 */}
            {currentPhotoCount !== undefined && (
              <div className="space-y-2 p-4 border-2 border-blue-400 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-base font-bold text-blue-900">
                    📊 현재 상태
                  </div>
                  {testMode && (
                    <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded-full font-semibold animate-pulse">
                      테스트 모드
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-sm bg-white p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-700 font-medium">📷 사진 개수:</span>
                    <span className="font-mono font-bold text-lg text-blue-600">{currentPhotoCount}장</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-700 font-medium">⏰ 남은 시간:</span>
                    <span className="font-mono font-bold text-neutral-900">
                      {hasTimeLeft
                        ? `${timeLeft?.days}일 ${timeLeft?.hours}시간 ${timeLeft?.minutes}분`
                        : '마감됨'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-700 font-medium">🎬 영상 상태:</span>
                    <span className="font-mono font-bold text-purple-600">
                      {currentVideoStatus || 'pending'}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t-2 border-blue-200">
                    <div className="text-neutral-700 font-medium mb-1">🔘 Secondary 버튼:</div>
                    <div className={`font-bold text-base p-2 rounded ${secondaryButtonDisabled ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                      "{secondaryButtonText}"
                    </div>
                    <div className={`text-sm mt-1 font-semibold ${secondaryButtonDisabled ? 'text-red-600' : 'text-green-600'}`}>
                      {secondaryButtonDisabled ? '❌ 비활성화됨' : '✅ 활성화됨'}
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                    setIsOpen(false); // DevTools 자동 닫기
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
            {onTestModeChange && onTestPhotoCountChange && onTestTimeOffsetChange && onTestVideoStatusChange && (
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
                    <div className="space-y-3">
                      {/* 사진 개수 제어 */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-neutral-700">사진 개수</p>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            onClick={() => {
                              onTestPhotoCountChange?.(0);
                              toast.success('사진 0장으로 설정');
                            }}
                            variant="outline"
                            className="h-8 text-xs"
                          >
                            0장
                          </Button>
                          <Button
                            onClick={() => {
                              onTestPhotoCountChange?.(5);
                              toast.success('사진 5장으로 설정');
                            }}
                            variant="outline"
                            className="h-8 text-xs"
                          >
                            5장
                          </Button>
                          <Button
                            onClick={() => {
                              onTestPhotoCountChange?.(15);
                              toast.success('사진 15장으로 설정');
                            }}
                            variant="outline"
                            className="h-8 text-xs"
                          >
                            15장
                          </Button>
                        </div>
                      </div>

                      {/* 시간 제어 */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-neutral-700">시간 설정</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={() => {
                              onTestTimeOffsetChange?.(48);
                              toast.success('시간 48시간 남음으로 설정');
                            }}
                            variant="outline"
                            className="h-8 text-xs"
                          >
                            시간 O
                          </Button>
                          <Button
                            onClick={() => {
                              onTestTimeOffsetChange?.(-1);
                              toast.success('시간 마감으로 설정');
                            }}
                            variant="outline"
                            className="h-8 text-xs"
                          >
                            시간 X
                          </Button>
                        </div>
                      </div>

                      {/* 영상 상태 제어 */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-neutral-700">영상 상태</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={() => {
                              onTestVideoStatusChange('pending');
                              toast.success('영상 상태: pending');
                            }}
                            variant="outline"
                            className="h-8 text-xs"
                          >
                            pending
                          </Button>
                          <Button
                            onClick={() => {
                              onTestVideoStatusChange('requested');
                              toast.success('영상 상태: requested');
                            }}
                            variant="outline"
                            className="h-8 text-xs"
                          >
                            requested
                          </Button>
                          <Button
                            onClick={() => {
                              onTestVideoStatusChange('processing');
                              toast.success('영상 상태: processing');
                            }}
                            variant="outline"
                            className="h-8 text-xs"
                          >
                            processing
                          </Button>
                          <Button
                            onClick={() => {
                              onTestVideoStatusChange('completed');
                              toast.success('영상 상태: completed');
                            }}
                            variant="outline"
                            className="h-8 text-xs"
                          >
                            completed
                          </Button>
                          <Button
                            onClick={() => {
                              onTestVideoStatusChange('failed');
                              toast.success('영상 상태: failed');
                            }}
                            variant="outline"
                            className="h-8 text-xs"
                          >
                            failed
                          </Button>
                          <Button
                            onClick={() => {
                              onTestVideoStatusChange(null);
                              toast.success('영상 상태: null');
                            }}
                            variant="outline"
                            className="h-8 text-xs"
                          >
                            null
                          </Button>
                        </div>
                      </div>

                      {/* 프리셋 */}
                      <div className="space-y-2 pt-2 border-t border-neutral-200">
                        <p className="text-xs font-medium text-neutral-700">프리셋</p>
                        <div className="space-y-1">
                          <Button
                            onClick={() => {
                              onTestPhotoCountChange?.(15);
                              onTestTimeOffsetChange?.(48);
                              onTestVideoStatusChange?.('pending');
                              toast.success('✅ 영상 생성 가능 상태');
                            }}
                            variant="outline"
                            className="w-full justify-start h-8 text-xs bg-green-50"
                          >
                            ✅ 영상 생성 가능
                          </Button>
                          <Button
                            onClick={() => {
                              onTestPhotoCountChange?.(5);
                              onTestTimeOffsetChange?.(48);
                              onTestVideoStatusChange?.('pending');
                              toast.success('📷 사진 부족 상태');
                            }}
                            variant="outline"
                            className="w-full justify-start h-8 text-xs"
                          >
                            📷 사진 부족
                          </Button>
                          <Button
                            onClick={() => {
                              onTestPhotoCountChange?.(15);
                              onTestTimeOffsetChange?.(-1);
                              onTestVideoStatusChange?.('pending');
                              toast.success('⏰ 시간 마감 상태');
                            }}
                            variant="outline"
                            className="w-full justify-start h-8 text-xs"
                          >
                            ⏰ 시간 마감
                          </Button>
                        </div>
                      </div>
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
