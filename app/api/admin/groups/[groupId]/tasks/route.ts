import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyAdminToken } from '@/lib/auth/jwt';
import type { ApiResponse } from '@/lib/supabase/types';

interface TaskStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

interface TaskItem {
  id: string;
  prompt: string;
  status: string;
  worker_id: string | null;
  generated_video_url: string | null;
  error_message: string | null;
  created_at: string;
}

interface PhotoGroup {
  photo_id: string;
  photo_url: string;
  tasks: TaskItem[];
}

interface GroupTasksData {
  group_id: string;
  stats: TaskStats;
  photos: PhotoGroup[];
}

/**
 * Admin: 특정 그룹의 Task 조회 (Photo별 그룹화)
 * GET /api/admin/groups/[groupId]/tasks
 */
export async function GET(
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

    // 1. 그룹 존재 확인
    const { data: group, error: groupError } = await supabaseAdmin
      .from('groups')
      .select('id')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '그룹을 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // 2. 그룹의 모든 video_items 조회
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('video_items')
      .select(
        `
        id,
        photo_id,
        prompt,
        status,
        worker_id,
        generated_video_url,
        error_message,
        created_at,
        photos!inner (
          id,
          storage_path
        )
      `
      )
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });

    if (itemsError) {
      console.error('Task 조회 오류:', itemsError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Task 조회에 실패했습니다.',
        },
        { status: 500 }
      );
    }

    // 3. 통계 계산
    const stats: TaskStats = {
      total: items?.length || 0,
      pending: items?.filter((item) => item.status === 'pending').length || 0,
      processing: items?.filter((item) => item.status === 'processing').length || 0,
      completed: items?.filter((item) => item.status === 'completed').length || 0,
      failed: items?.filter((item) => item.status === 'failed').length || 0,
    };

    // 4. Photo별로 그룹화
    const photoMap = new Map<string, { storage_path: string; tasks: TaskItem[] }>();

    items?.forEach((item: any) => {
      const photoId = item.photo_id;
      const storagePath = item.photos?.storage_path || '';

      if (!photoMap.has(photoId)) {
        photoMap.set(photoId, {
          storage_path: storagePath,
          tasks: [],
        });
      }

      photoMap.get(photoId)!.tasks.push({
        id: item.id,
        prompt: item.prompt,
        status: item.status,
        worker_id: item.worker_id,
        generated_video_url: item.generated_video_url,
        error_message: item.error_message,
        created_at: item.created_at,
      });
    });

    // 5. Photo presigned URL 생성
    const photos: PhotoGroup[] = await Promise.all(
      Array.from(photoMap.entries()).map(async ([photoId, photoData]) => {
        let photoUrl = '';

        if (photoData.storage_path) {
          const { data: signedData } = await supabaseAdmin.storage
            .from('group-photos')
            .createSignedUrl(photoData.storage_path, 3600); // 1시간

          photoUrl = signedData?.signedUrl || '';
        }

        return {
          photo_id: photoId,
          photo_url: photoUrl,
          tasks: photoData.tasks,
        };
      })
    );

    const responseData: GroupTasksData = {
      group_id: groupId,
      stats,
      photos,
    };

    return NextResponse.json<ApiResponse<GroupTasksData>>({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('Admin groups/tasks API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
