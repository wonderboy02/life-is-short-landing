import { z } from 'zod';

/**
 * 그룹 생성 스키마
 */
export const createGroupSchema = z.object({
  comment: z
    .string()
    .min(1, '가족들에게 한마디를 입력해주세요')
    .max(200, '한마디는 최대 200자까지 가능합니다')
    .trim(),
  creatorNickname: z
    .string()
    .min(1, '생성자 닉네임을 입력해주세요')
    .max(50, '닉네임은 최대 50자까지 가능합니다')
    .trim(),
  contact: z
    .string()
    .min(1, '연락처를 입력해주세요')
    .max(100, '연락처는 최대 100자까지 가능합니다')
    .trim(),
  password: z
    .string()
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다')
    .max(50, '비밀번호는 최대 50자까지 가능합니다'),
});

/**
 * 사진 업로드 스키마
 */
export const uploadPhotoSchema = z.object({
  groupId: z.string().uuid('유효하지 않은 그룹 ID입니다'),
  uploaderNickname: z
    .string()
    .max(50, '닉네임은 최대 50자까지 가능합니다')
    .optional(),
});

/**
 * 비밀번호 검증 스키마
 */
export const verifyPasswordSchema = z.object({
  groupId: z.string().uuid('유효하지 않은 그룹 ID입니다'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

/**
 * 사진 삭제 스키마
 */
export const deletePhotoSchema = z.object({
  groupId: z.string().uuid('유효하지 않은 그룹 ID입니다'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

/**
 * 허용된 이미지 MIME 타입
 */
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const;

/**
 * 최대 파일 크기 (20MB)
 */
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
