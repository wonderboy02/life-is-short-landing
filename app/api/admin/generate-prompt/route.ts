import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyAdminToken } from '@/lib/auth/jwt';
import type { ApiResponse } from '@/lib/supabase/types';

/**
 * Admin: Gemini AI를 사용하여 사진 기반 프롬프트 생성
 * POST /api/admin/generate-prompt
 */
export async function POST(req: NextRequest) {
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

    // 요청 바디 파싱
    const { photo_url, existing_prompt } = await req.json();

    if (!photo_url) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'photo_url이 필요합니다.',
        },
        { status: 400 }
      );
    }

    // Gemini API 키 확인
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Gemini API 키가 설정되지 않았습니다.',
        },
        { status: 500 }
      );
    }

    // Gemini AI 초기화
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // 이미지 데이터 가져오기
    const imageResponse = await fetch(photo_url);
    if (!imageResponse.ok) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: '이미지를 가져올 수 없습니다.',
        },
        { status: 400 }
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');

    // 프롬프트 템플릿 (모드에 따라 다름)
    const promptTemplate = existing_prompt?.trim()
      ? // Enhancement 모드: 기존 프롬프트 개선
        `You are generating a VIDEO prompt from a photo.

Base idea: "${existing_prompt}"

Create a dynamic but plausible video by:
- Choosing ONLY ONE primary motion focus:
  (camera OR people OR environment)
- Adding cinematic camera movement ONLY if it fits the photo
- Describing clear, physical motion that could realistically occur
- Avoiding impossible actions for the subjects in the photo

Make it lively and cinematic, but still believable for Image-to-Video.

Keep under 120 characters.
Return ONLY the video prompt in ENGLISH.`;

    // Gemini API 호출
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      },
      { text: promptTemplate },
    ]);

    const response = await result.response;
    const generatedPrompt = response.text().trim();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        prompt: generatedPrompt,
      },
    });
  } catch (error) {
    console.error('Gemini AI 프롬프트 생성 오류:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'AI 프롬프트 생성 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
