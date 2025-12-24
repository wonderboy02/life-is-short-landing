import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyWorkerAuth } from '@/lib/auth/worker';
import type { ApiResponse } from '@/lib/supabase/types';

interface HeartbeatRequest {
  item_id: string;
  worker_id: string;
  extend_seconds?: number; // 기본 300 (5분)
}

interface HeartbeatData {
  leased_until: string;
}

/**
 * Worker: Lease 연장 (Heartbeat)
 * POST /api/worker/heartbeat
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

    const body: HeartbeatRequest = await req.json();
    const { item_id, worker_id, extend_seconds = 300 } = body;

    // 필수 파라미터 검증
    if (!item_id || !worker_id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'item_id and worker_id are required',
        },
        { status: 400 }
      );
    }

    // Lease 연장
    const newLeasedUntil = new Date(Date.now() + extend_seconds * 1000).toISOString();

    const { data: updatedTask, error: updateError } = await supabaseAdmin
      .from('video_items')
      .update({
        leased_until: newLeasedUntil,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item_id)
      .eq('worker_id', worker_id)
      .eq('status', 'processing')
      .select('leased_until')
      .single();

    if (updateError || !updatedTask) {
      console.error('Heartbeat 업데이트 오류:', updateError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Failed to extend lease. Task may not exist or worker_id mismatch.',
        },
        { status: 404 }
      );
    }

    const responseData: HeartbeatData = {
      leased_until: updatedTask.leased_until!,
    };

    return NextResponse.json<ApiResponse<HeartbeatData>>({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('Worker heartbeat API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
