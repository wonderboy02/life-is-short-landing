import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { verifyToken } from '@/lib/auth/jwt';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/validations/schemas';
import type { ApiResponse, PhotoUploadResponse } from '@/lib/supabase/types';
import { sendSlackNotificationAsync } from '@/lib/slack/webhook';
import { createPhotoUploadedMessage } from '@/lib/slack/messages';

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
    const description = formData.get('description') as string | null;

    if (!file) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '파일이 필요합니다.',
        },
        { status: 400 }
      );
    }

    if (!uploaderNickname?.trim()) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '업로더 닉네임이 필요합니다.',
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

    // 그룹 정보 조회
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('creator_nickname, share_code')
      .eq('id', payload.groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '그룹 정보를 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // 파일명 생성
    const photoId = crypto.randomUUID();
    const extension = file.name.split('.').pop() || 'jpg';
    const storagePath = `${payload.groupId}/${photoId}_original.${extension}`;

    // 다운로드용 파일명 생성: {닉네임}_{코드}_{photoId앞8자리}.{확장자}
    const sanitizedNickname = group.creator_nickname.replace(/[^a-zA-Z0-9가-힣]/g, '');
    const shortCode = group.share_code || payload.groupId.substring(0, 6);
    const shortId = photoId.substring(0, 8);
    const downloadFileName = `${sanitizedNickname}_${shortCode}_${shortId}.${extension}`;

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
        file_name: downloadFileName,
        file_size: file.size,
        mime_type: file.type,
        uploader_nickname: uploaderNickname.trim(),
        description: description?.trim() || null,
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

    // Slack 알림 전송 (비동기, fire-and-forget)
    sendSlackNotificationAsync(
      createPhotoUploadedMessage({
        photoId: photo.id,
        groupId: photo.group_id,
        shareCode: group.share_code,
        uploaderNickname: photo.uploader_nickname,
        fileName: photo.file_name,
        fileSize: photo.file_size,
        mimeType: photo.mime_type,
        description: photo.description || undefined,
        uploadedAt: photo.created_at,
      })
    );

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
