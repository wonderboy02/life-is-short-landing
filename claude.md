# 프로젝트 지침

## ⚠️ 중요: 모바일 전용 프로젝트

**이 레포지토리는 모바일 전용입니다.**
- 모든 기능과 UI는 모바일 화면에 최적화되어야 함
- 데스크톱 지원은 고려하지 않음
- 모바일 뷰포트 기준: 320px ~ 428px (주로 375px 기준)
- 터치 인터랙션 우선 설계
- 모바일 성능 최적화 필수 (이미지, 비디오 최적화)

## 코딩 원칙

### 전문가 수준의 코드 작성
- **타입 안정성**: TypeScript의 strict mode를 준수하고, any 타입 사용 최소화
- **성능 최적화**: React.memo, useMemo, useCallback을 적절히 활용
- **코드 가독성**: 명확한 변수명, 함수명 사용 및 단일 책임 원칙(SRP) 준수
- **재사용성**: 공통 로직은 hooks나 utils로 분리
- **접근성**: ARIA 속성 및 시맨틱 HTML 사용
- **보안**: XSS, CSRF 등 보안 취약점 방지
- **테스트**: 핵심 로직에 대한 단위 테스트 작성 권장
- **일관성**: 프로젝트 전체에서 일관된 코딩 스타일 유지

### 모바일 최적화
- 이미지: WebP 포맷, lazy loading, 적절한 사이즈
- 비디오: 최적화된 해상도, autoplay 신중히 사용
- 폰트: 가변 폰트 사용, FOUT/FOIT 방지
- 터치 타겟: 최소 44x44px 크기 유지
- 스크롤 성능: will-change, transform 활용

### 컴포넌트 설계
- 작고 집중된 컴포넌트 작성
- Props 인터페이스 명확하게 정의
- 서버 컴포넌트와 클라이언트 컴포넌트 적절히 구분 (Next.js App Router)

## 디렉터리 구조

```
life_is_short_landing/
├── .claude/                    # Claude 설정 파일
├── .vscode/                    # VS Code 설정
├── app/                        # Next.js App Router
│   ├── globals.css            # 전역 스타일
│   ├── layout.tsx             # 루트 레이아웃
│   └── page.tsx               # 메인 페이지
├── components/                 # React 컴포넌트
│   ├── theme-provider.tsx     # 테마 프로바이더
│   └── ui/                    # shadcn/ui 컴포넌트 라이브러리
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ... (40+ UI 컴포넌트)
├── hooks/                      # 커스텀 React hooks
├── lib/                        # 유틸리티 함수
├── public/                     # 정적 파일
│   ├── favicon/               # 파비콘
│   ├── *.mp4                  # 비디오 파일
│   └── *.jpg                  # 이미지 파일
├── scripts/                    # 빌드/배포 스크립트
├── styles/                     # 추가 스타일 파일
├── components.json            # shadcn/ui 설정
├── next.config.mjs            # Next.js 설정
├── package.json               # 의존성 관리
├── tsconfig.json              # TypeScript 설정
└── tailwind.config.ts         # Tailwind CSS 설정
```

## 기술 스택

- **프레임워크**: Next.js (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 라이브러리**: shadcn/ui
- **패키지 매니저**: npm/pnpm
