import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyWorkerAuth } from '@/lib/auth/worker';
import type { ApiResponse } from '@/lib/supabase/types';

interface NextTaskRequest {
  worker_id: string;
  lease_duration_seconds?: number; // 기본 600 (10분)
}

interface NextTaskData {
  item_id: string;
  group_id: string;
  photo_id: string;
  prompt: string;
  leased_until: string;
  photo_storage_path: string;
}

/**
 * Worker: 다음 Task 요청
 * POST /api/worker/next-task
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

    const body: NextTaskRequest = await req.json();
    const { worker_id, lease_duration_seconds = 600 } = body;

    if (!worker_id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'worker_id is required',
        },
        { status: 400 }
      );
    }

    // 1. 할당 가능한 Task 찾기
    // - status = 'pending' 또는
    // - status = 'processing' AND leased_until < NOW() (lease 만료)
    // - retry_count < 3
    const { data: availableTasks, error: findError } = await supabaseAdmin
      .from('video_items')
      .select('id, status, leased_until, retry_count')
      .or('status.eq.pending,and(status.eq.processing,leased_until.lt.now())')
      .lt('retry_count', 3)
      .order('created_at', { ascending: true })
      .limit(1);

    if (findError) {
      console.error('Task 조회 오류:', findError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Failed to fetch tasks',
        },
        { status: 500 }
      );
    }

    // 작업 없음
    if (!availableTasks || availableTasks.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: true,
        data: null,
      });
    }

    const taskId = availableTasks[0].id;

    // 2. Task 상태 업데이트 (lease 설정)
    const leasedUntil = new Date(Date.now() + lease_duration_seconds * 1000).toISOString();

    const { data: updatedTask, error: updateError } = await supabaseAdmin
      .from('video_items')
      .update({
        status: 'processing',
        leased_until: leasedUntil,
        worker_id,
        processing_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .select()
      .single();

    if (updateError || !updatedTask) {
      console.error('Task 업데이트 오류:', updateError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Failed to assign task',
        },
        { status: 500 }
      );
    }

    // 3. Photo 정보 JOIN (storage_path 가져오기)
    const { data: photoData, error: photoError } = await supabaseAdmin
      .from('photos')
      .select('storage_path')
      .eq('id', updatedTask.photo_id)
      .single();

    if (photoError || !photoData) {
      console.error('Photo 조회 오류:', photoError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Failed to fetch photo data',
        },
        { status: 500 }
      );
    }

    // 4. 응답 반환
    const responseData: NextTaskData = {
      item_id: updatedTask.id,
      group_id: updatedTask.group_id,
      photo_id: updatedTask.photo_id,
      prompt: updatedTask.prompt,
      leased_until: updatedTask.leased_until!,
      photo_storage_path: photoData.storage_path,
    };

    return NextResponse.json<ApiResponse<NextTaskData>>({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('Worker next-task API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
