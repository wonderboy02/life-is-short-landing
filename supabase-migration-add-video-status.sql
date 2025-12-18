-- Add video_status column to groups table
-- 영상 제작 상태를 추적하기 위한 컬럼 추가
-- 가능한 값: 'pending', 'requested', 'processing', 'completed', 'failed'

ALTER TABLE groups
ADD COLUMN video_status TEXT DEFAULT 'pending';

-- video_status 컬럼에 대한 체크 제약 조건 추가 (선택사항)
ALTER TABLE groups
ADD CONSTRAINT groups_video_status_check
CHECK (video_status IN ('pending', 'requested', 'processing', 'completed', 'failed'));

-- 기존 레코드들은 기본값 'pending'으로 설정됨
UPDATE groups
SET video_status = 'pending'
WHERE video_status IS NULL;

-- 인덱스 추가 (상태별 조회 성능 향상)
CREATE INDEX idx_groups_video_status ON groups(video_status);

-- 코멘트 추가
COMMENT ON COLUMN groups.video_status IS '영상 제작 상태: pending(대기), requested(신청), processing(처리중), completed(완료), failed(실패)';
