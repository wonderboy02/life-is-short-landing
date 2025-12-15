-- ================================================
-- Life Is Short - 사진 공유 기능 DB 스키마
-- ================================================
-- 이 SQL을 Supabase Dashboard > SQL Editor에서 실행하세요
-- ================================================

-- ================================================
-- 1. groups 테이블: JWT 기반 인증을 위한 그룹 정보
-- ================================================
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT groups_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100)
);

-- 검색 성능을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON groups(created_at DESC);

-- ================================================
-- 2. photos 테이블: 그룹별 업로드된 사진 정보
-- ================================================
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(50) NOT NULL,
  uploader_nickname VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT photos_file_size_check CHECK (file_size > 0 AND file_size <= 10485760), -- 최대 10MB
  CONSTRAINT photos_mime_type_check CHECK (mime_type IN ('image/jpeg', 'image/jpg', 'image/png', 'image/webp'))
);

-- 그룹별 사진 조회 성능 최적화
CREATE INDEX IF NOT EXISTS idx_photos_group_id_created_at ON photos(group_id, created_at DESC);

-- ================================================
-- 3. Row Level Security (RLS) 정책
-- ================================================
-- RLS 활성화
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 그룹 생성 가능
DROP POLICY IF EXISTS "groups_insert_policy" ON groups;
CREATE POLICY "groups_insert_policy" ON groups
  FOR INSERT
  WITH CHECK (true);

-- 모든 사용자가 그룹 조회 가능
DROP POLICY IF EXISTS "groups_select_policy" ON groups;
CREATE POLICY "groups_select_policy" ON groups
  FOR SELECT
  USING (true);

-- 모든 사용자가 사진 삽입 가능
DROP POLICY IF EXISTS "photos_insert_policy" ON photos;
CREATE POLICY "photos_insert_policy" ON photos
  FOR INSERT
  WITH CHECK (true);

-- 모든 사용자가 사진 조회 가능
DROP POLICY IF EXISTS "photos_select_policy" ON photos;
CREATE POLICY "photos_select_policy" ON photos
  FOR SELECT
  USING (true);

-- 모든 사용자가 사진 삭제 가능 (비밀번호 검증은 애플리케이션 레벨에서)
DROP POLICY IF EXISTS "photos_delete_policy" ON photos;
CREATE POLICY "photos_delete_policy" ON photos
  FOR DELETE
  USING (true);

-- ================================================
-- 4. updated_at 자동 업데이트 트리거
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON groups
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- 완료!
-- ================================================
-- 다음 단계:
-- 1. Supabase Dashboard > Storage에서 'group-photos' 버킷 생성 (Public)
-- 2. .env.local 파일에 환경 변수 설정
-- ================================================
