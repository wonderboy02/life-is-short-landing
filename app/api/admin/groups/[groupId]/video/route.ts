import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyAdminToken } from '@/lib/auth/jwt';
import type { ApiResponse } from '@/lib/supabase/types';

/**
 * Admin: 영상 제작 상태 변경
 * PATCH /api/admin/groups/[groupId]/video
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;

    // Admin JWT 검증
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '인증이 필요합니다.',
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyAdminToken(token);
    if (!payload) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '유효하지 않은 토큰입니다.',
        },
        { status: 401 }
      );
    }
    const body = await req.json();
    const { video_status } = body;

    // video_status 유효성 검증
    const validStatuses = ['pending', 'requested', 'processing', 'completed', 'failed'];
    if (!video_status || !validStatuses.includes(video_status)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `유효하지 않은 상태입니다. 가능한 값: ${validStatuses.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 그룹 존재 확인
    const { data: group, error: fetchError } = await supabaseAdmin
      .from('groups')
      .select('id, video_status')
      .eq('id', groupId)
      .single();

    if (fetchError || !group) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '그룹을 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // video_status 업데이트
    const { error: updateError } = await supabaseAdmin
      .from('groups')
      .update({ video_status })
      .eq('id', groupId);

    if (updateError) {
      console.error('영상 상태 변경 오류:', updateError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '영상 상태 변경에 실패했습니다.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        message: '영상 상태가 변경되었습니다.',
        groupId,
        previousStatus: group.video_status,
        newStatus: video_status,
      },
    });
  } catch (error) {
    console.error('Admin 영상 상태 변경 API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
