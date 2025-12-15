import { z } from 'zod';

/**
 * 그룹 생성 스키마
 */
export const createGroupSchema = z.object({
  name: z
    .string()
    .min(1, '그룹 이름을 입력해주세요')
    .max(100, '그룹 이름은 최대 100자까지 가능합니다')
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
 * 최대 파일 크기 (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
