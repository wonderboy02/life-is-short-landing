import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { verifyToken } from '@/lib/auth/jwt';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/validations/schemas';
import type { ApiResponse, PhotoUploadResponse } from '@/lib/supabase/types';

export async function POST(req: NextRequest) {
  try {
    // JWT 검증
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
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '유효하지 않은 토큰입니다.',
        },
        { status: 401 }
      );
    }

    // FormData 파싱
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const uploaderNickname = formData.get('uploaderNickname') as string | null;

    if (!file) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '파일이 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 파일 검증
    if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'JPG, PNG, WebP 형식만 지원합니다.',
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '파일 크기는 최대 10MB까지 가능합니다.',
        },
        { status: 400 }
      );
    }

    // 파일명 생성
    const photoId = crypto.randomUUID();
    const extension = file.name.split('.').pop() || 'jpg';
    const storagePath = `${payload.groupId}/${photoId}_original.${extension}`;

    // Supabase Storage에 업로드
    const { error: uploadError } = await supabase.storage
      .from('group-photos')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage 업로드 오류:', uploadError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '파일 업로드에 실패했습니다.',
        },
        { status: 500 }
      );
    }

    // DB에 메타데이터 저장
    const { data: photo, error: dbError } = await supabase
      .from('photos')
      .insert({
        id: photoId,
        group_id: payload.groupId,
        storage_path: storagePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        uploader_nickname: uploaderNickname || null,
      })
      .select()
      .single();

    if (dbError || !photo) {
      console.error('DB 저장 오류:', dbError);
      // 업로드된 파일 삭제
      await supabase.storage.from('group-photos').remove([storagePath]);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '사진 정보 저장에 실패했습니다.',
        },
        { status: 500 }
      );
    }

    // Public URL 생성
    const { data: urlData } = supabase.storage
      .from('group-photos')
      .getPublicUrl(storagePath);

    return NextResponse.json<ApiResponse<PhotoUploadResponse>>({
      success: true,
      data: {
        photoId: photo.id,
        url: urlData.publicUrl,
      },
    });
  } catch (error) {
    console.error('사진 업로드 API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
