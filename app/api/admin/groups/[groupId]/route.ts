import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { supabase } from '@/lib/supabase/client';
import { verifyAdminToken } from '@/lib/auth/jwt';
import { hashPassword } from '@/lib/auth/password';
import type { ApiResponse, PhotoWithUrl, Group } from '@/lib/supabase/types';

export interface AdminGroupDetail extends Group {
  photos: PhotoWithUrl[];
  photo_count: number;
}

/**
 * 그룹 상세 정보 조회 (Admin)
 * GET /api/admin/groups/[groupId]
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

    // 그룹 정보 조회
    const { data: group, error: groupError } = await supabaseAdmin
      .from('groups')
      .select('*')
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

    // 그룹의 사진 목록 조회
    const { data: photos, error: photosError } = await supabaseAdmin
      .from('photos')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (photosError) {
      console.error('사진 목록 조회 오류:', photosError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '사진 목록을 불러올 수 없습니다.',
        },
        { status: 500 }
      );
    }

    // Storage Public URL 생성
    const photosWithUrl: PhotoWithUrl[] = (photos || []).map((photo) => {
      const { data } = supabase.storage
        .from('group-photos')
        .getPublicUrl(photo.storage_path);

      return {
        ...photo,
        url: data.publicUrl,
      };
    });

    const groupDetail: AdminGroupDetail = {
      ...group,
      photos: photosWithUrl,
      photo_count: photosWithUrl.length,
    };

    return NextResponse.json<ApiResponse<AdminGroupDetail>>({
      success: true,
      data: groupDetail,
    });
  } catch (error) {
    console.error('Admin 그룹 상세 API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

/**
 * 그룹 삭제 (Admin)
 * DELETE /api/admin/groups/[groupId]
 */
export async function DELETE(
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

    // 그룹에 속한 모든 사진 조회
    const { data: photos, error: photosError } = await supabaseAdmin
      .from('photos')
      .select('storage_path')
      .eq('group_id', groupId);

    if (photosError) {
      console.error('사진 목록 조회 오류:', photosError);
    }

    // Storage에서 모든 사진 파일 삭제
    if (photos && photos.length > 0) {
      const storagePaths = photos.map((p) => p.storage_path);
      const { error: storageError } = await supabaseAdmin.storage
        .from('group-photos')
        .remove(storagePaths);

      if (storageError) {
        console.error('Storage 삭제 오류:', storageError);
      }
    }

    // DB에서 사진 레코드 삭제 (CASCADE로 자동 삭제될 수도 있지만 명시적으로)
    const { error: deletePhotosError } = await supabaseAdmin
      .from('photos')
      .delete()
      .eq('group_id', groupId);

    if (deletePhotosError) {
      console.error('사진 DB 삭제 오류:', deletePhotosError);
    }

    // 그룹 삭제
    const { error: deleteGroupError } = await supabaseAdmin
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (deleteGroupError) {
      console.error('그룹 삭제 오류:', deleteGroupError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '그룹 삭제에 실패했습니다.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
    });
  } catch (error) {
    console.error('Admin 그룹 삭제 API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

/**
 * 그룹 정보 수정 (Admin)
 * PATCH /api/admin/groups/[groupId]
 */
export async function PATCH(
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

    const body = await req.json();
    const { comment, password } = body;

    // 업데이트할 필드 준비
    const updateData: { comment?: string; password_hash?: string } = {};

    if (comment && typeof comment === 'string' && comment.trim()) {
      updateData.comment = comment.trim();
    }

    if (password && typeof password === 'string') {
      updateData.password_hash = await hashPassword(password);
    }

    // 업데이트할 내용이 없는 경우
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '수정할 내용이 없습니다.',
        },
        { status: 400 }
      );
    }

    // 그룹 정보 업데이트
    const { data: updatedGroup, error: updateError } = await supabaseAdmin
      .from('groups')
      .update(updateData)
      .eq('id', groupId)
      .select()
      .single();

    if (updateError || !updatedGroup) {
      console.error('그룹 업데이트 오류:', updateError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '그룹 정보 수정에 실패했습니다.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<Group>>({
      success: true,
      data: updatedGroup,
    });
  } catch (error) {
    console.error('Admin 그룹 수정 API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
