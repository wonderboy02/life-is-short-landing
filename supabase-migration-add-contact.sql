-- Migration: Add contact to groups table
-- Date: 2025-12-18
-- Description: 그룹 생성자 연락처 필드 추가 (영상 수령용, 전달 후 즉시 폐기)

-- groups 테이블에 contact 컬럼 추가
ALTER TABLE groups
ADD COLUMN IF NOT EXISTS contact VARCHAR(100) NOT NULL DEFAULT '';

-- 기존 데이터에 대한 기본값은 DEFAULT로 자동 설정됨
-- 필요시 특정 값으로 업데이트 가능:
-- UPDATE groups SET contact = '' WHERE contact = '';

-- 변경사항 확인
-- SELECT id, creator_nickname, contact, created_at FROM groups ORDER BY created_at DESC LIMIT 10;
