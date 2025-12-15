import { NextRequest, NextResponse } from 'next/server';
import { generateAdminToken } from '@/lib/auth/jwt';
import type { ApiResponse } from '@/lib/supabase/types';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  throw new Error('ADMIN_PASSWORD 환경 변수가 설정되지 않았습니다.');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '비밀번호가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 관리자 비밀번호 확인
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '비밀번호가 일치하지 않습니다.',
        },
        { status: 401 }
      );
    }

    // Admin JWT 생성
    const token = generateAdminToken();

    return NextResponse.json<ApiResponse<{ token: string }>>({
      success: true,
      data: { token },
    });
  } catch (error) {
    console.error('Admin 로그인 API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
