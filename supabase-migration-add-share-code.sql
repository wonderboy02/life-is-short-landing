-- ================================================
-- Share Code 추가: URL 길이 단축
-- ================================================
-- JWT 대신 짧은 공유 코드 (8자) 사용
-- 예: /share/abc12xyz
-- ================================================

-- 1. groups 테이블에 share_code 컬럼 추가
ALTER TABLE groups
ADD COLUMN IF NOT EXISTS share_code VARCHAR(10) UNIQUE;

-- 2. share_code 인덱스 생성 (빠른 조회)
CREATE UNIQUE INDEX IF NOT EXISTS idx_groups_share_code ON groups(share_code);

-- 3. 기존 그룹들에 share_code 생성 (선택사항)
-- 이미 생성된 그룹이 있다면 실행
-- UPDATE groups SET share_code = substring(md5(random()::text), 1, 8) WHERE share_code IS NULL;

-- ================================================
-- 완료!
-- ================================================
