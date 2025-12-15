-- Migration: Add creator_nickname to groups table
-- Date: 2025-12-15
-- Description: 그룹 생성자 닉네임 필드 추가

-- groups 테이블에 creator_nickname 컬럼 추가
ALTER TABLE groups
ADD COLUMN IF NOT EXISTS creator_nickname VARCHAR(50) NOT NULL DEFAULT '익명';

-- 기존 데이터에 대한 기본값은 DEFAULT로 자동 설정됨
-- 필요시 특정 값으로 업데이트 가능:
-- UPDATE groups SET creator_nickname = '그룹 생성자' WHERE creator_nickname = '익명';

-- 인덱스 추가 (선택사항 - 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_groups_creator_nickname ON groups(creator_nickname);

-- 변경사항 확인
-- SELECT id, name, creator_nickname, created_at FROM groups ORDER BY created_at DESC LIMIT 10;
