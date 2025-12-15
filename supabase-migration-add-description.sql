-- ================================================
-- 사진 설명(Caption) 추가
-- ================================================

-- photos 테이블에 description 컬럼 추가
ALTER TABLE photos
ADD COLUMN IF NOT EXISTS description TEXT;

-- uploader_nickname을 필수로 변경 (기존 NULL 허용 → NOT NULL)
-- 기존 데이터가 있다면 먼저 업데이트 필요
UPDATE photos SET uploader_nickname = '익명' WHERE uploader_nickname IS NULL;

ALTER TABLE photos
ALTER COLUMN uploader_nickname SET NOT NULL;

-- ================================================
-- 완료!
-- ================================================
