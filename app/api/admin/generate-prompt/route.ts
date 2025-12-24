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
        `You are a prompt-writer for IMAGE-TO-VIDEO generation (I2V), optimized for high success rate.

Input:
- User idea: "${existing_prompt}"

Task:
Create ONE enhanced I2V video prompt in ENGLISH that is dynamic but still plausible for the given photo.

Rules (follow strictly):
1) Be SIMPLE and DIRECT. Do NOT describe the image contents in detail. Focus on MOTION. (I2V)
2) Choose a Motion Budget:
   - Pick exactly 1 PRIMARY motion focus: {CAMERA | SUBJECT | ENVIRONMENT}
   - Pick at most 1 SECONDARY motion focus (optional)
   - Everything else must be constrained to stay stable.
3) Use clear shot grammar in this order:
   [SHOT/FRAMING] + [PRIMARY MOTION] + [SECONDARY MOTION] + [STABILITY CONSTRAINTS] + [STYLE]
4) Prefer gentle camera moves (smooth dolly-in, slow pan, slight orbit). Avoid complex multi-axis camera moves.
5) If you choose SUBJECT motion, keep it physically plausible from a still photo:
   - Favor micro-to-medium actions (turn head slightly, blink, shift weight, raise hand slowly)
   - Avoid fast actions (running, dancing) unless the photo clearly supports it.
6) Add explicit constraints to reduce common I2V failures:
   - preserve identity, preserve facial structure, no warping, no extra limbs/fingers, no jitter/flicker,
     keep proportions, no text artifacts
7) Output length target: 120–180 characters (not 100). Short but complete.
8) Return ONLY the final prompt (no explanations, no lists).

Now generate the enhanced I2V prompt.`
      : // Generation 모드: 새로운 프롬프트 생성
        `You are a prompt-writer for IMAGE-TO-VIDEO generation (I2V), optimized for high success rate.

Task:
Analyze this photo and create ONE I2V video prompt in ENGLISH that is dynamic but still plausible.

Rules (follow strictly):
1) Be SIMPLE and DIRECT. Do NOT describe the image contents in detail. Focus on MOTION. (I2V)
2) Choose a Motion Budget:
   - Pick exactly 1 PRIMARY motion focus: {CAMERA | SUBJECT | ENVIRONMENT}
   - Pick at most 1 SECONDARY motion focus (optional)
   - Everything else must be constrained to stay stable.
3) Use clear shot grammar in this order:
   [SHOT/FRAMING] + [PRIMARY MOTION] + [SECONDARY MOTION] + [STABILITY CONSTRAINTS] + [STYLE]
4) Prefer gentle camera moves (smooth dolly-in, slow pan, slight orbit). Avoid complex multi-axis camera moves.
5) If you choose SUBJECT motion, keep it physically plausible from a still photo:
   - Favor micro-to-medium actions (turn head slightly, blink, shift weight, raise hand slowly)
   - Avoid fast actions (running, dancing) unless the photo clearly supports it.
6) Add explicit constraints to reduce common I2V failures:
   - preserve identity, preserve facial structure, no warping, no extra limbs/fingers, no jitter/flicker,
     keep proportions, no text artifacts
7) Output length target: 120–180 characters (not 100). Short but complete.
8) Return ONLY the final prompt (no explanations, no lists).

Now generate the I2V prompt based on what you see in the photo.`;

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
