import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyAdminToken } from '@/lib/auth/jwt';
import type { ApiResponse } from '@/lib/supabase/types';

/**
 * 사진 삭제 (Admin)
 * DELETE /api/admin/photos/[photoId]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const { photoId } = await params;

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

    // 사진 정보 조회
    const { data: photo, error: photoError } = await supabaseAdmin
      .from('photos')
      .select('storage_path')
      .eq('id', photoId)
      .single();

    if (photoError || !photo) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '사진을 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // Storage에서 파일 삭제
    const { error: storageError } = await supabaseAdmin.storage
      .from('group-photos')
      .remove([photo.storage_path]);

    if (storageError) {
      console.error('Storage 삭제 오류:', storageError);
    }

    // DB에서 레코드 삭제
    const { error: deleteError } = await supabaseAdmin
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (deleteError) {
      console.error('DB 삭제 오류:', deleteError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '사진 삭제에 실패했습니다.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
    });
  } catch (error) {
    console.error('Admin 사진 삭제 API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
