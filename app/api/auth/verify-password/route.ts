import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyPassword } from '@/lib/auth/password';
import { verifyPasswordSchema } from '@/lib/validations/schemas';
import type { ApiResponse, VerifyPasswordResponse } from '@/lib/supabase/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 입력 검증
    const validation = verifyPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const { groupId, password } = validation.data;

    // 그룹 조회
    const { data: group, error } = await supabaseAdmin
      .from('groups')
      .select('password_hash')
      .eq('id', groupId)
      .single();

    if (error || !group) {
      return NextResponse.json<ApiResponse<VerifyPasswordResponse>>({
        success: true,
        data: { valid: false },
      });
    }

    // 비밀번호 검증
    const isValid = await verifyPassword(password, group.password_hash);

    return NextResponse.json<ApiResponse<VerifyPasswordResponse>>({
      success: true,
      data: { valid: isValid },
    });
  } catch (error) {
    console.error('비밀번호 검증 API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
