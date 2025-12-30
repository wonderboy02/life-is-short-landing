import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyAdminToken } from '@/lib/auth/jwt';
import type { ApiResponse } from '@/lib/supabase/types';
import { extractStoragePathFromPresignedUrl } from '@/lib/utils/storage-path';

/**
 * Admin: Task 삭제
 * DELETE /api/admin/tasks/[taskId]
 */
export async function DELETE(
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

    console.log(`[Task 삭제 시작] ID: ${taskId}`);

    // Task 조회 (비디오 URL 가져오기)
    const { data: task, error: fetchError } = await supabaseAdmin
      .from('video_items')
      .select('generated_video_url')
      .eq('id', taskId)
      .single();

    if (fetchError) {
      console.error('Task 조회 오류:', fetchError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Task를 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // Storage에서 비디오 파일 삭제
    if (task?.generated_video_url) {
      const storagePath = extractStoragePathFromPresignedUrl(task.generated_video_url);

      if (storagePath) {
        console.log(`[Storage 삭제 시도] 파일: ${storagePath}`);
        const { error: storageError } = await supabaseAdmin.storage
          .from('generated-videos')
          .remove([storagePath]);

        if (storageError) {
          console.error('✗ 비디오 Storage 삭제 실패:', storageError);
          // Storage 삭제 실패해도 계속 진행
        } else {
          console.log(`✓ Storage 파일 삭제 완료: ${storagePath}`);
        }
      } else {
        console.warn('비디오 URL에서 storage path를 추출할 수 없습니다:', {
          taskId,
          url: task.generated_video_url,
        });
      }
    } else {
      console.log('[Storage 삭제 스킵] 비디오 URL이 없음 (pending/failed task)');
    }

    // DB 레코드 삭제
    const { error: deleteError } = await supabaseAdmin
      .from('video_items')
      .delete()
      .eq('id', taskId);

    if (deleteError) {
      console.error('Task 삭제 오류:', deleteError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Task 삭제에 실패했습니다.',
        },
        { status: 500 }
      );
    }

    console.log(`✓ Task 삭제 완료: ${taskId}`);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error('Admin tasks/[taskId] DELETE API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
