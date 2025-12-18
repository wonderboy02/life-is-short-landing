import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '10y';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET 환경 변수가 설정되지 않았습니다.');
}

if (JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET은 최소 32자 이상이어야 합니다.');
}

export interface JWTPayload {
  groupId: string;
  comment: string;
}

export interface AdminJWTPayload {
  isAdmin: true;
  loginTime: number;
}

/**
 * JWT 토큰 생성 (그룹용)
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * JWT 토큰 검증 및 디코딩 (그룹용)
 * @returns 유효한 경우 payload, 그렇지 않으면 null
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT 검증 실패:', error);
    return null;
  }
}

/**
 * Admin JWT 토큰 생성
 */
export function generateAdminToken(): string {
  const payload: AdminJWTPayload = {
    isAdmin: true,
    loginTime: Date.now(),
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Admin JWT 토큰 검증
 * @returns 유효한 경우 payload, 그렇지 않으면 null
 */
export function verifyAdminToken(token: string): AdminJWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminJWTPayload;
    if (decoded.isAdmin === true) {
      return decoded;
    }
    return null;
  } catch (error) {
    console.error('Admin JWT 검증 실패:', error);
    return null;
  }
}
