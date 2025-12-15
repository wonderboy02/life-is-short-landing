import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generateToken } from '@/lib/auth/jwt';
import { isValidShareCode } from '@/lib/utils/share-code';
import type { ApiResponse } from '@/lib/supabase/types';

/**
 * Share Code로 그룹 조회 + JWT 발급
 * GET /api/groups/verify?code=abc12xyz
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const shareCode = searchParams.get('code');

    if (!shareCode) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '공유 코드가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // Share Code 형식 검증
    if (!isValidShareCode(shareCode)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '유효하지 않은 공유 코드입니다.',
        },
        { status: 400 }
      );
    }

    // 그룹 조회
    const { data: group, error } = await supabaseAdmin
      .from('groups')
      .select('id, name')
      .eq('share_code', shareCode)
      .single();

    if (error || !group) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '존재하지 않는 그룹입니다.',
        },
        { status: 404 }
      );
    }

    // JWT 생성 (사진 업로드용)
    const token = generateToken({
      groupId: group.id,
      groupName: group.name,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        groupId: group.id,
        groupName: group.name,
        token,
      },
    });
  } catch (error) {
    console.error('그룹 검증 API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
