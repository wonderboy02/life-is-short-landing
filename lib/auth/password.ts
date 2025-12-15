import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * 비밀번호 해싱
 * @param password 평문 비밀번호
 * @returns bcrypt 해시
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * 비밀번호 검증
 * @param password 평문 비밀번호
 * @param hash 저장된 bcrypt 해시
 * @returns 일치 여부
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('비밀번호 검증 오류:', error);
    return false;
  }
}
