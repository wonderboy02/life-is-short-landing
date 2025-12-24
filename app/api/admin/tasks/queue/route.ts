import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyAdminToken } from '@/lib/auth/jwt';
import type { ApiResponse } from '@/lib/supabase/types';

interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

interface QueueItem {
  id: string;
  group_id: string;
  photo_id: string;
  photo_url: string;
  prompt: string;
  status: string;
  worker_id: string | null;
  error_message: string | null;
  retry_count: number;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  generated_video_url: string | null;
  created_at: string;
}

interface QueueData {
  stats: QueueStats;
  items: QueueItem[];
}

/**
 * Admin: 전체 Task 큐 조회
 * GET /api/admin/tasks/queue
 */
export async function GET(req: NextRequest) {
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

    // Query 파라미터 추출
    const { searchParams } = new URL(req.url);
    const groupIdFilter = searchParams.get('group_id');
    const photoIdFilter = searchParams.get('photo_id');
    const statusFilter = searchParams.get('status');

    // 1. 전체 통계 조회
    let statsQuery = supabaseAdmin.from('video_items').select('status', { count: 'exact' });

    if (groupIdFilter) {
      statsQuery = statsQuery.eq('group_id', groupIdFilter);
    }
    if (photoIdFilter) {
      statsQuery = statsQuery.eq('photo_id', photoIdFilter);
    }
    if (statusFilter) {
      statsQuery = statsQuery.eq('status', statusFilter);
    }

    const { data: allItems, error: statsError, count: totalCount } = await statsQuery;

    if (statsError) {
      console.error('통계 조회 오류:', statsError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '통계 조회에 실패했습니다.',
        },
        { status: 500 }
      );
    }

    const stats: QueueStats = {
      total: totalCount || 0,
      pending: allItems?.filter((item) => item.status === 'pending').length || 0,
      processing: allItems?.filter((item) => item.status === 'processing').length || 0,
      completed: allItems?.filter((item) => item.status === 'completed').length || 0,
      failed: allItems?.filter((item) => item.status === 'failed').length || 0,
    };

    // 2. Task 목록 조회 (photos JOIN)
    let itemsQuery = supabaseAdmin
      .from('video_items')
      .select(
        `
        id,
        group_id,
        photo_id,
        prompt,
        status,
        worker_id,
        error_message,
        retry_count,
        processing_started_at,
        processing_completed_at,
        generated_video_url,
        created_at,
        photos!inner (
          storage_path
        )
      `
      )
      .order('created_at', { ascending: false });

    if (groupIdFilter) {
      itemsQuery = itemsQuery.eq('group_id', groupIdFilter);
    }
    if (photoIdFilter) {
      itemsQuery = itemsQuery.eq('photo_id', photoIdFilter);
    }
    if (statusFilter) {
      itemsQuery = itemsQuery.eq('status', statusFilter);
    }

    const { data: itemsData, error: itemsError } = await itemsQuery;

    if (itemsError) {
      console.error('Task 목록 조회 오류:', itemsError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Task 목록 조회에 실패했습니다.',
        },
        { status: 500 }
      );
    }

    // 3. Photo presigned URL 생성
    const items: QueueItem[] = await Promise.all(
      (itemsData || []).map(async (item: any) => {
        const storagePath = item.photos?.storage_path;
        let photoUrl = '';

        if (storagePath) {
          const { data: signedData } = await supabaseAdmin.storage
            .from('group-photos')
            .createSignedUrl(storagePath, 3600); // 1시간

          photoUrl = signedData?.signedUrl || '';
        }

        return {
          id: item.id,
          group_id: item.group_id,
          photo_id: item.photo_id,
          photo_url: photoUrl,
          prompt: item.prompt,
          status: item.status,
          worker_id: item.worker_id,
          error_message: item.error_message,
          retry_count: item.retry_count,
          processing_started_at: item.processing_started_at,
          processing_completed_at: item.processing_completed_at,
          generated_video_url: item.generated_video_url,
          created_at: item.created_at,
        };
      })
    );

    const responseData: QueueData = {
      stats,
      items,
    };

    return NextResponse.json<ApiResponse<QueueData>>({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('Admin tasks/queue API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
