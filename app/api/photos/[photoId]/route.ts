import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyPassword } from '@/lib/auth/password';
import { deletePhotoSchema } from '@/lib/validations/schemas';
import type { ApiResponse } from '@/lib/supabase/types';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const { photoId } = await params;
    const body = await req.json();

    // 입력 검증
    const validation = deletePhotoSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const { groupId, password } = validation.data;

    // 그룹 비밀번호 검증
    const { data: group, error: groupError } = await supabaseAdmin
      .from('groups')
      .select('password_hash')
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

    const isValid = await verifyPassword(password, group.password_hash);
    if (!isValid) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '비밀번호가 일치하지 않습니다.',
        },
        { status: 403 }
      );
    }

    // 사진 정보 조회
    const { data: photo, error: photoError } = await supabaseAdmin
      .from('photos')
      .select('storage_path, group_id')
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

    // 그룹 소유 확인
    if (photo.group_id !== groupId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '권한이 없습니다.',
        },
        { status: 403 }
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
    console.error('사진 삭제 API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
