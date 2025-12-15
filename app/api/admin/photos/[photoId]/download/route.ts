import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyAdminToken } from '@/lib/auth/jwt';
import type { ApiResponse } from '@/lib/supabase/types';

/**
 * 사진 다운로드 (Admin)
 * GET /api/admin/photos/[photoId]/download
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const { photoId } = await params;

    // Admin JWT 검증
    const authHeader = req.headers.get('authorization');
    const searchParams = req.nextUrl.searchParams;
    const tokenParam = searchParams.get('token');

    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (tokenParam) {
      token = tokenParam;
    }

    if (!token) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '인증이 필요합니다.',
        },
        { status: 401 }
      );
    }

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
      .select('storage_path, file_name, mime_type')
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

    // Storage에서 파일 다운로드
    const { data, error: downloadError } = await supabaseAdmin.storage
      .from('group-photos')
      .download(photo.storage_path);

    if (downloadError || !data) {
      console.error('Storage 다운로드 오류:', downloadError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '파일 다운로드에 실패했습니다.',
        },
        { status: 500 }
      );
    }

    // Blob을 ArrayBuffer로 변환
    const arrayBuffer = await data.arrayBuffer();

    // 파일 다운로드 응답 반환
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': photo.mime_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(photo.file_name)}"`,
        'Content-Length': arrayBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Admin 사진 다운로드 API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
