import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyAdminToken } from '@/lib/auth/jwt';
import type { ApiResponse } from '@/lib/supabase/types';

export interface AdminGroupListItem {
  id: string;
  name: string;
  share_code: string;
  created_at: string;
  updated_at: string;
  photo_count: number;
}

/**
 * 전체 그룹 목록 조회 (Admin)
 * GET /api/admin/groups
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

    // 그룹 목록 조회
    const { data: groups, error: groupsError } = await supabaseAdmin
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (groupsError) {
      console.error('그룹 목록 조회 오류:', groupsError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '그룹 목록을 불러올 수 없습니다.',
        },
        { status: 500 }
      );
    }

    // 각 그룹의 사진 개수 조회
    const groupsWithCount = await Promise.all(
      groups.map(async (group) => {
        const { count } = await supabaseAdmin
          .from('photos')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id);

        return {
          id: group.id,
          name: group.name,
          share_code: group.share_code,
          created_at: group.created_at,
          updated_at: group.updated_at,
          photo_count: count || 0,
        } as AdminGroupListItem;
      })
    );

    return NextResponse.json<ApiResponse<{ groups: AdminGroupListItem[]; total: number }>>({
      success: true,
      data: {
        groups: groupsWithCount,
        total: groupsWithCount.length,
      },
    });
  } catch (error) {
    console.error('Admin 그룹 목록 API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
