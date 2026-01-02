import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { verifyToken } from '@/lib/auth/jwt';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/validations/schemas';
import type {
  ApiResponse,
  PhotoMetadataRequest,
  PhotoMetadataResponse,
} from '@/lib/supabase/types';
import { sendSlackNotificationAsync } from '@/lib/slack/webhook';
import { createPhotoUploadedMessage } from '@/lib/slack/messages';

/**
 * 사진 메타데이터 저장 API
 *
 * 클라이언트가 Supabase Storage에 직접 업로드한 후,
 * 메타데이터만 이 API를 통해 DB에 저장합니다.
 *
 * Vercel 4.5MB body size limit를 우회하기 위한 방식입니다.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. JWT 검증
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

    // 2. Request Body 파싱 (JSON)
    const body: PhotoMetadataRequest = await req.json();
    const {
      photoId,
      groupId,
      storagePath,
      fileName,
      fileSize,
      mimeType,
      uploaderNickname,
      description,
    } = body;

    // 3. 필수 필드 검증
    if (!photoId || !groupId || !storagePath || !fileName || !uploaderNickname) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '필수 필드가 누락되었습니다.',
        },
        { status: 400 }
      );
    }

    // 4. GroupId 검증 (JWT payload와 일치 여부)
    if (groupId !== payload.groupId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '권한이 없습니다.',
        },
        { status: 403 }
      );
    }

    // 5. 파일 크기 검증
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `파일 크기는 최대 ${MAX_FILE_SIZE / 1024 / 1024}MB까지 가능합니다.`,
        },
        { status: 400 }
      );
    }

    // 6. MIME 타입 검증
    if (!ALLOWED_MIME_TYPES.includes(mimeType as any)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'JPG, PNG, WebP 형식만 지원합니다.',
        },
        { status: 400 }
      );
    }

    // 7. 그룹 정보 조회 (Slack 알림용)
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('share_code, creator_nickname')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      console.error('그룹 조회 오류:', groupError);
      // 그룹이 없어도 계속 진행 (share_code는 optional)
    }

    // 8. DB에 메타데이터 저장
    const { data: photo, error: dbError } = await supabase
      .from('photos')
      .insert({
        id: photoId,
        group_id: groupId,
        storage_path: storagePath,
        file_name: fileName,
        file_size: fileSize,
        mime_type: mimeType,
        uploader_nickname: uploaderNickname.trim(),
        description: description?.trim() || null,
      })
      .select()
      .single();

    if (dbError || !photo) {
      console.error('DB 저장 오류:', dbError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'DB 저장에 실패했습니다.',
        },
        { status: 500 }
      );
    }

    // 9. Public URL 생성
    const { data: urlData } = supabase.storage
      .from('group-photos')
      .getPublicUrl(storagePath);

    // 10. Slack 알림 (비동기, fire-and-forget)
    sendSlackNotificationAsync(
      createPhotoUploadedMessage({
        photoId: photo.id,
        groupId: photo.group_id,
        shareCode: group?.share_code,
        uploaderNickname: photo.uploader_nickname,
        fileName: photo.file_name,
        fileSize: photo.file_size,
        mimeType: photo.mime_type,
        description: photo.description || undefined,
        uploadedAt: photo.created_at,
      })
    );

    // 11. 응답
    return NextResponse.json<ApiResponse<PhotoMetadataResponse>>({
      success: true,
      data: {
        photoId: photo.id,
        url: urlData.publicUrl,
      },
    });
  } catch (error) {
    console.error('메타데이터 저장 API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
