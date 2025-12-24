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
        `Analyze this photo and enhance the following video generation prompt.

Current prompt: "${existing_prompt}"

Enhance it by:
- Making it more specific and vivid based on what you see in the image
- Adding relevant visual details and motion suggestions
- Improving the descriptive language
- Keeping it concise (under 100 characters)
- Maintaining the original intent

IMPORTANT: Return ONLY the enhanced prompt text in ENGLISH, without any explanation or additional text.`
      : // Generation 모드: 새로운 프롬프트 생성
        `Analyze this photo and generate a creative, concise prompt for AI video generation.

Your prompt should:
- Describe the main subjects and scene
- Suggest interesting motion or animation
- Capture the mood and atmosphere
- Be specific about visual elements
- Keep it under 100 characters

IMPORTANT: Return ONLY the prompt text in ENGLISH, without any explanation or additional text.`;

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
