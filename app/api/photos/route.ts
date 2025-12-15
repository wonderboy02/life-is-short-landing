import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { ApiResponse, PhotoListResponse, PhotoWithUrl } from '@/lib/supabase/types';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'groupId가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 사진 목록 조회
    const { data: photos, error } = await supabase
      .from('photos')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('사진 목록 조회 오류:', error);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '사진 목록을 불러올 수 없습니다.',
        },
        { status: 500 }
      );
    }

    // Storage Public URL 생성
    const photosWithUrl: PhotoWithUrl[] = photos.map((photo) => {
      const { data } = supabase.storage
        .from('group-photos')
        .getPublicUrl(photo.storage_path);

      return {
        ...photo,
        url: data.publicUrl,
      };
    });

    return NextResponse.json<ApiResponse<PhotoListResponse>>({
      success: true,
      data: {
        photos: photosWithUrl,
        total: photosWithUrl.length,
      },
    });
  } catch (error) {
    console.error('사진 목록 API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
