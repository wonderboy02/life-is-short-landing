import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyAdminToken } from '@/lib/auth/jwt';
import type { ApiResponse } from '@/lib/supabase/types';

interface TaskAddRequest {
  group_id: string;
  tasks: Array<{
    photo_id: string;
    prompt: string;
    repeat_count: number; // 1 이상
  }>;
}

interface TaskAddData {
  total_items_added: number;
  items: Array<{
    id: string;
    photo_id: string;
    prompt: string;
  }>;
}

/**
 * Admin: Task 큐에 추가
 * POST /api/admin/tasks/add
 */
export async function POST(req: NextRequest) {
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

    const body: TaskAddRequest = await req.json();
    const { group_id, tasks } = body;

    // 파라미터 검증
    if (!group_id || !tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'group_id와 tasks 배열이 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 1. 그룹 존재 확인
    const { data: group, error: groupError } = await supabaseAdmin
      .from('groups')
      .select('id')
      .eq('id', group_id)
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

    // 2. 모든 photo_id 수집 및 그룹 소속 확인
    const photoIds = [...new Set(tasks.map((t) => t.photo_id))];

    const { data: photos, error: photosError } = await supabaseAdmin
      .from('photos')
      .select('id, group_id')
      .in('id', photoIds);

    if (photosError || !photos) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '사진 조회에 실패했습니다.',
        },
        { status: 500 }
      );
    }

    // 모든 사진이 해당 그룹에 속하는지 확인
    const invalidPhotos = photos.filter((p) => p.group_id !== group_id);
    if (invalidPhotos.length > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `일부 사진이 해당 그룹에 속하지 않습니다: ${invalidPhotos.map((p) => p.id).join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 누락된 사진 확인
    if (photos.length !== photoIds.length) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '일부 사진을 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // 3. video_items 일괄 생성 (repeat_count만큼 반복)
    const itemsToInsert: Array<{
      group_id: string;
      photo_id: string;
      prompt: string;
      status: 'pending';
    }> = [];

    tasks.forEach((task) => {
      if (!task.photo_id || !task.prompt || task.repeat_count < 1) {
        return; // 유효하지 않은 task는 건너뛰기
      }

      for (let i = 0; i < task.repeat_count; i++) {
        itemsToInsert.push({
          group_id,
          photo_id: task.photo_id,
          prompt: task.prompt,
          status: 'pending',
        });
      }
    });

    if (itemsToInsert.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '유효한 task가 없습니다.',
        },
        { status: 400 }
      );
    }

    const { data: insertedItems, error: insertError } = await supabaseAdmin
      .from('video_items')
      .insert(itemsToInsert)
      .select('id, photo_id, prompt');

    if (insertError || !insertedItems) {
      console.error('Task 생성 오류:', insertError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Task 생성에 실패했습니다.',
        },
        { status: 500 }
      );
    }

    // 4. (선택) 그룹의 video_status를 'requested'로 업데이트
    await supabaseAdmin.from('groups').update({ video_status: 'requested' }).eq('id', group_id);

    const responseData: TaskAddData = {
      total_items_added: insertedItems.length,
      items: insertedItems,
    };

    return NextResponse.json<ApiResponse<TaskAddData>>({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('Admin tasks/add API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
