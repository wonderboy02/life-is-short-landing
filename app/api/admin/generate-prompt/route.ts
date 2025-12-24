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

    // Gemini AI 초기화 (System Instruction 추가)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: `You are an expert I2V (Image-to-Video) prompt writer.

CRITICAL RULES YOU MUST FOLLOW:
1. DO NOT describe the photo. DO NOT list what you see.
2. ONLY output a VIDEO GENERATION PROMPT with MOTION and CAMERA MOVEMENT.
3. Focus on what MOVES, what CHANGES, how the CAMERA MOVES.
4. Output format: Direct prompt only, no explanations.

Example of WRONG output (photo description):
"A person standing in a park with trees"

Example of CORRECT output (video prompt):
"Slow dolly-in on subject, gentle head turn, preserve facial features, cinematic lighting"`,
    });

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
        `⚠️ CRITICAL: This is IMAGE-TO-VIDEO generation. DO NOT describe the photo.

User's concept: "${existing_prompt}"

Your task: Transform this into a DYNAMIC but PLAUSIBLE VIDEO PROMPT optimized for I2V.

STRICT RULES:
1) Choose a MOTION BUDGET:
   - Select ONE primary motion only:
     {CAMERA movement | SUBJECT movement | ENVIRONMENT movement}
   - Optionally add ONE secondary motion
   - Everything else must remain stable
2) Avoid risky combinations:
   - If CAMERA moves → SUBJECT motion must be minimal
   - If SUBJECT motion is primary → camera must be simple
   - Avoid facial expression changes unless SUBJECT motion is primary
3) Prefer physically plausible motions from a still image:
   - breathing, blinking, slight weight shift, gentle support
   - slow dolly-in, slow pan, smooth zoom
4) Always add constraints to reduce I2V failures:
   preserve identity, preserve facial structure, no warping,
   no extra limbs or fingers, no jitter or flicker

FORBIDDEN in output:
✗ Photo descriptions ("a person standing", "beautiful scenery")
✗ Static descriptions with no motion
✗ Lists, explanations, or meta comments

Output format (120–180 chars):
[Shot / camera] + [primary motion] + [secondary motion] + [constraints], [style]

Example output:
"Slow dolly-in on family, subtle breathing and blinking, faces remain neutral, preserve identity, soft film grain"

Now write the VIDEO PROMPT based on user's idea "${existing_prompt}":`
      : // Generation 모드: 새로운 프롬프트 생성
        `⚠️ CRITICAL: This is IMAGE-TO-VIDEO generation. DO NOT describe the photo.

Your task: Create a DYNAMIC but PLAUSIBLE VIDEO PROMPT optimized for I2V.

STRICT RULES:
1) Choose a MOTION BUDGET:
   - Select ONE primary motion only:
     {CAMERA movement | SUBJECT movement | ENVIRONMENT movement}
   - Optionally add ONE secondary motion
   - Everything else must remain stable
2) Avoid risky combinations:
   - If CAMERA moves → SUBJECT motion must be minimal
   - If SUBJECT motion is primary → camera must be simple
   - Avoid facial expression changes unless SUBJECT motion is primary
3) Prefer physically plausible motions:
   - breathing, blinking, slight weight shift
   - slow dolly-in, slow pan, smooth zoom
4) Always add constraints:
   preserve identity, preserve facial structure,
   no warping, no extra limbs, no jitter or flicker

FORBIDDEN in output:
✗ Photo descriptions
✗ Static scenes
✗ Lists or explanations

Output format (120–180 chars):
[Shot / camera] + [primary motion] + [secondary motion] + [constraints], [style]

Example outputs:
"Slow dolly-in, subject breathes and blinks subtly, face remains neutral, preserve identity, cinematic film grain"
"Smooth pan across scene, fabric moves gently in wind, subjects remain still, no warping, nostalgic tone"

Now write the VIDEO PROMPT:`;

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
    let generatedPrompt = response.text().trim();

    // 따옴표 제거 (앞뒤 쌍따옴표 또는 홑따옴표)
    generatedPrompt = generatedPrompt.replace(/^["']|["']$/g, '');

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
