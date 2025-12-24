import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyAdminToken } from '@/lib/auth/jwt';
import type { ApiResponse } from '@/lib/supabase/types';

/**
 * Admin: Task 재시도
 * POST /api/admin/tasks/[taskId]/retry
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
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

    const { taskId } = await params;

    // Task 존재 확인
    const { data: task, error: taskError } = await supabaseAdmin
      .from('video_items')
      .select('id, status, retry_count')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Task를 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // 재시도 가능한 상태인지 확인 (failed만 재시도 가능)
    if (task.status !== 'failed') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '재시도는 실패한 Task만 가능합니다.',
        },
        { status: 400 }
      );
    }

    // Task를 pending 상태로 리셋
    const { error: updateError } = await supabaseAdmin
      .from('video_items')
      .update({
        status: 'pending',
        leased_until: null,
        worker_id: null,
        error_message: null,
        processing_started_at: null,
        processing_completed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (updateError) {
      console.error('Task 재시도 오류:', updateError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Task 재시도에 실패했습니다.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error('Admin tasks/[taskId]/retry POST API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
