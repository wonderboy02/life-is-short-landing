import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyWorkerAuth } from '@/lib/auth/worker';
import type { ApiResponse } from '@/lib/supabase/types';

interface PresignRequest {
  operation: 'download' | 'upload';
  storage_path?: string; // download용
  video_item_id?: string; // upload용
  file_extension?: string; // upload용 (기본 'mp4')
}

interface PresignData {
  url: string;
  expires_in: number; // 3600 (1시간)
  storage_path?: string; // upload인 경우
}

/**
 * Worker: Presigned URL 발급
 * POST /api/worker/presign
 */
export async function POST(req: NextRequest) {
  try {
    // Worker 인증 검증
    const authHeader = req.headers.get('authorization');
    if (!verifyWorkerAuth(authHeader)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const body: PresignRequest = await req.json();
    const { operation, storage_path, video_item_id, file_extension = 'mp4' } = body;

    if (!operation || !['download', 'upload'].includes(operation)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'operation must be "download" or "upload"',
        },
        { status: 400 }
      );
    }

    const expiresIn = 3600; // 1시간

    // Download: 입력 이미지 다운로드
    if (operation === 'download') {
      if (!storage_path) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'storage_path is required for download',
          },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin.storage
        .from('group-photos')
        .createSignedUrl(storage_path, expiresIn);

      if (error || !data) {
        console.error('Download presigned URL 생성 오류:', error);
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'Failed to generate download URL',
          },
          { status: 500 }
        );
      }

      const responseData: PresignData = {
        url: data.signedUrl,
        expires_in: expiresIn,
      };

      return NextResponse.json<ApiResponse<PresignData>>({
        success: true,
        data: responseData,
      });
    }

    // Upload: 생성된 비디오 업로드
    if (operation === 'upload') {
      if (!video_item_id) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'video_item_id is required for upload',
          },
          { status: 400 }
        );
      }

      // 업로드 경로: videos/{video_item_id}.{ext}
      const uploadPath = `videos/${video_item_id}.${file_extension}`;

      const { data, error } = await supabaseAdmin.storage
        .from('generated-videos')
        .createSignedUploadUrl(uploadPath);

      if (error || !data) {
        console.error('Upload presigned URL 생성 오류:', error);
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'Failed to generate upload URL',
          },
          { status: 500 }
        );
      }

      const responseData: PresignData = {
        url: data.signedUrl,
        expires_in: expiresIn,
        storage_path: uploadPath,
      };

      return NextResponse.json<ApiResponse<PresignData>>({
        success: true,
        data: responseData,
      });
    }

    // 이론상 도달 불가
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Invalid operation',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Worker presign API 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
