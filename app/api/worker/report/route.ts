import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyWorkerAuth } from '@/lib/auth/worker';
import type { ApiResponse } from '@/lib/supabase/types';

interface ReportRequest {
  item_id: string;
  worker_id: string;
  status: 'completed' | 'failed';
  video_storage_path?: string; // completed용
  error_message?: string; // failed용
  veo_operation_id?: string; // 선택
}

/**
 * Worker: Task 결과 보고
 * POST /api/worker/report
 */
export async function POST(req: NextRequest) {
  try {
    // Worker 인증 검증
    const authHeader = req.headers.get('authorization');
    if (!verifyWorkerAuth(authHeader)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const body: ReportRequest = await req.json();
    const { item_id, worker_id, status, video_storage_path, error_message, veo_operation_id } =
      body;

    // 필수 파라미터 검증
    if (!item_id || !worker_id || !status) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'item_id, worker_id, and status are required',
        },
        { status: 400 }
      );
    }

    if (!['completed', 'failed'].includes(status)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'status must be "completed" or "failed"',
        },
        { status: 400 }
      );
    }

    // 1. Task 조회 및 Worker ID 검증
    const { data: task, error: fetchError } = await supabaseAdmin
      .from('video_items')
      .select('id, worker_id, group_id, leased_until, retry_count')
      .eq('id', item_id)
      .single();

    if (fetchError || !task) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Task not found',
        },
        { status: 404 }
      );
    }

    // Worker ID 일치 확인
    if (task.worker_id !== worker_id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Worker ID mismatch',
        },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();

    // 2. Task 상태 업데이트
    if (status === 'completed') {
      if (!video_storage_path) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'video_storage_path is required for completed status',
          },
          { status: 400 }
        );
      }

      // 비디오 presigned URL 생성 (7일 유효)
      const { data: signedData, error: signError } = await supabaseAdmin.storage
        .from('generated-videos')
        .createSignedUrl(video_storage_path, 604800); // 7일 = 604800초

      if (signError || !signedData) {
        console.error('비디오 presigned URL 생성 오류:', signError);
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'Failed to generate video URL',
          },
          { status: 500 }
        );
      }

      const { error: updateError } = await supabaseAdmin
        .from('video_items')
        .update({
          status: 'completed',
          generated_video_url: signedData.signedUrl,
          processing_completed_at: now,
          veo_operation_id: veo_operation_id || null,
          updated_at: now,
        })
        .eq('id', item_id)
        .eq('worker_id', worker_id);

      if (updateError) {
        console.error('Task 완료 업데이트 오류:', updateError);
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'Failed to update task',
          },
          { status: 500 }
        );
      }
    } else if (status === 'failed') {
      const { error: updateError } = await supabaseAdmin
        .from('video_items')
        .update({
          status: 'failed',
          error_message: error_message || 'Unknown error',
          retry_count: task.retry_count + 1,
          processing_completed_at: now,
          updated_at: now,
        })
        .eq('id', item_id)
        .eq('worker_id', worker_id);

      if (updateError) {
        console.error('Task 실패 업데이트 오류:', updateError);
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'Failed to update task',
          },
          { status: 500 }
        );
      }
    }

    // 3. (선택) 그룹의 모든 task 완료 여부 확인
    const { data: groupTasks, error: groupTasksError } = await supabaseAdmin
      .from('video_items')
      .select('id, status')
      .eq('group_id', task.group_id);

    if (!groupTasksError && groupTasks) {
      const allCompleted = groupTasks.every((t) => t.status === 'completed');
      const anyProcessing = groupTasks.some((t) => t.status === 'processing');

      if (allCompleted) {
        // 모든 task 완료 → group video_status = 'completed'
        await supabaseAdmin.from('groups').update({ video_status: 'completed' }).eq('id', task.group_id);
      } else if (anyProcessing) {
        // 일부 task 처리 중 → group video_status = 'processing'
        await supabaseAdmin.from('groups').update({ video_status: 'processing' }).eq('id', task.group_id);
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        message: `Task ${status}`,
        item_id,
      },
    });
  } catch (error) {
    console.error('Worker report API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
