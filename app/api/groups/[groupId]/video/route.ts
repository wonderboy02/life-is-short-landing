import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { ApiResponse } from '@/lib/supabase/types';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;

    // groupId 검증
    if (!groupId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '그룹 ID가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 그룹 존재 여부 및 현재 상태 확인
    const { data: group, error: fetchError } = await supabaseAdmin
      .from('groups')
      .select('id, video_status, created_at')
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

    // 이미 요청된 상태인지 확인
    if (group.video_status !== 'pending') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `영상 제작이 이미 ${group.video_status === 'requested' ? '신청' : group.video_status === 'processing' ? '처리 중' : group.video_status === 'completed' ? '완료' : '처리'}되었습니다.`,
        },
        { status: 400 }
      );
    }

    // 사진 개수 확인 (최소 10장)
    const { count, error: countError } = await supabaseAdmin
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId);

    if (countError) {
      console.error('사진 개수 확인 오류:', countError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '사진 개수를 확인할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    const MIN_PHOTOS = 10;
    if (!count || count < MIN_PHOTOS) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `영상 제작을 위해 최소 ${MIN_PHOTOS}장의 사진이 필요합니다. (현재: ${count || 0}장)`,
        },
        { status: 400 }
      );
    }

    // video_status를 'requested'로 업데이트
    const { error: updateError } = await supabaseAdmin
      .from('groups')
      .update({ video_status: 'requested' })
      .eq('id', groupId);

    if (updateError) {
      console.error('영상 제작 요청 오류:', updateError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '영상 제작 요청에 실패했습니다.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        message: '영상 제작이 신청되었습니다.',
        groupId,
        videoStatus: 'requested',
      },
    });
  } catch (error) {
    console.error('영상 제작 API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

// GET: 영상 제작 상태 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;

    if (!groupId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '그룹 ID가 필요합니다.',
        },
        { status: 400 }
      );
    }

    const { data: group, error } = await supabaseAdmin
      .from('groups')
      .select('id, video_status')
      .eq('id', groupId)
      .single();

    if (error || !group) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '그룹을 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        groupId: group.id,
        videoStatus: group.video_status,
      },
    });
  } catch (error) {
    console.error('영상 상태 조회 API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
