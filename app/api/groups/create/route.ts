import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { hashPassword } from '@/lib/auth/password';
import { generateShareCode } from '@/lib/utils/share-code';
import { createGroupSchema } from '@/lib/validations/schemas';
import type { ApiResponse, GroupCreateResponse } from '@/lib/supabase/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 입력 검증
    const validation = createGroupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const { name, password } = validation.data;

    // 비밀번호 해싱
    const passwordHash = await hashPassword(password);

    // 짧은 공유 코드 생성 (최대 5번 재시도)
    let shareCode = '';
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      shareCode = generateShareCode();

      // share_code 중복 확인
      const { data: existing } = await supabaseAdmin
        .from('groups')
        .select('id')
        .eq('share_code', shareCode)
        .single();

      if (!existing) {
        break; // 중복 없음, 사용 가능
      }

      attempts++;
    }

    if (attempts === maxAttempts) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '공유 코드 생성에 실패했습니다. 다시 시도해주세요.',
        },
        { status: 500 }
      );
    }

    // 그룹 생성
    const { data: group, error } = await supabaseAdmin
      .from('groups')
      .insert({
        name,
        password_hash: passwordHash,
        share_code: shareCode,
      })
      .select()
      .single();

    if (error || !group) {
      console.error('그룹 생성 오류:', error);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '그룹 생성에 실패했습니다. 잠시 후 다시 시도해주세요.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<GroupCreateResponse>>({
      success: true,
      data: {
        shareCode: group.share_code,
        groupId: group.id,
        groupName: group.name,
      },
    });
  } catch (error) {
    console.error('그룹 생성 API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
