# API 테스트 스크립트 가이드

WAN Worker 시스템의 API를 테스트하기 위한 스크립트입니다.

## 📋 목차

- [사전 준비](#사전-준비)
- [테스트 스크립트 종류](#테스트-스크립트-종류)
- [실행 방법](#실행-방법)
- [예상 결과](#예상-결과)
- [문제 해결](#문제-해결)

---

## 사전 준비

### 1. 개발 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:3000`에서 실행 중이어야 합니다.

### 2. Admin 토큰 발급

1. 브라우저에서 `http://localhost:3000/admin` 접속
2. Admin 비밀번호로 로그인 (기본값: `teko`)
3. 개발자 도구(F12) → Console 탭에서 다음 실행:
   ```javascript
   localStorage.getItem('admin_token')
   ```
4. 출력된 토큰 복사 (따옴표 제외)

### 3. Group ID 확인

1. Admin 대시보드에서 그룹 목록 확인
2. 테스트할 그룹의 ID 복사
3. 또는 그룹 상세 페이지 URL에서 ID 확인:
   ```
   /admin/groups/[여기가-GROUP-ID]
   ```

### 4. Group에 사진 업로드

테스트를 위해 그룹에 최소 1장의 사진이 있어야 합니다.

---

## 테스트 스크립트 종류

### 1. Worker API 테스트 (`test-worker-api.js`)

Worker API 엔드포인트를 개별적으로 테스트합니다.

**테스트 항목:**
- ✅ Worker 인증 (성공/실패)
- ✅ Next Task API
- ✅ Presign Download API
- ✅ Presign Upload API
- ✅ Heartbeat API
- ✅ Report Completed API
- ✅ Report Failed API

### 2. Admin API 테스트 (`test-admin-api.js`)

Admin API 엔드포인트를 개별적으로 테스트합니다.

**테스트 항목:**
- ✅ Admin 인증 (성공/실패)
- ✅ Tasks Queue API
- ✅ Tasks Queue API (필터링)
- ✅ Group Tasks API
- ✅ Tasks Add API

### 3. 전체 워크플로우 테스트 (`test-full-workflow.js`)

Admin → Worker 전체 흐름을 통합 테스트합니다.

**테스트 시나리오:**
1. Admin이 Task 추가
2. Worker가 Task 할당받기
3. Worker가 Presigned URL 받기
4. Worker가 추론 시뮬레이션
5. Worker가 Heartbeat 전송
6. Worker가 완료 보고
7. Admin이 결과 확인

---

## 실행 방법

### Option 1: npm 스크립트 사용

```bash
# Worker API 테스트
npm run test:worker

# Admin API 테스트 (대화형)
npm run test:admin

# 전체 워크플로우 테스트 (대화형)
npm run test:workflow
```

### Option 2: 환경변수와 함께 실행

```bash
# Worker API 테스트
node scripts/test-worker-api.js

# Admin API 테스트
ADMIN_TOKEN=<your-token> GROUP_ID=<group-id> node scripts/test-admin-api.js

# 전체 워크플로우 테스트
ADMIN_TOKEN=<your-token> GROUP_ID=<group-id> node scripts/test-full-workflow.js
```

### Option 3: Windows 환경변수 설정

**PowerShell:**
```powershell
$env:ADMIN_TOKEN="eyJhbGc..."
$env:GROUP_ID="abc-123-def-456"
npm run test:admin
```

**CMD:**
```cmd
set ADMIN_TOKEN=eyJhbGc...
set GROUP_ID=abc-123-def-456
npm run test:admin
```

---

## 예상 결과

### Worker API 테스트 성공 예시

```
╔════════════════════════════════════════════════════════════╗
║          Worker API 테스트 스크립트 시작                 ║
╚════════════════════════════════════════════════════════════╝

ℹ Base URL: http://localhost:3000
ℹ Worker ID: test-worker-1735012345678
ℹ API Key: i39dg0edin...

============================================================
테스트: Worker 인증 실패 테스트
============================================================
ℹ 잘못된 API Key로 401 응답 확인
✓ Worker 인증 실패 테스트 테스트 통과

============================================================
테스트: Worker 인증 성공 테스트
============================================================
ℹ 응답: { "success": true, "data": null }
✓ Worker 인증 성공 테스트 테스트 통과

...

╔════════════════════════════════════════════════════════════╗
║                    테스트 결과 요약                        ║
╚════════════════════════════════════════════════════════════╝

총 테스트: 8
✓ 통과: 8

성공률: 100.0%
```

### 전체 워크플로우 테스트 성공 예시

```
╔════════════════════════════════════════════════════════════╗
║       전체 워크플로우 통합 테스트 시작                   ║
╚════════════════════════════════════════════════════════════╝

[Step 1] 그룹의 사진 목록 가져오기
✓ 3개의 사진 발견

[Step 2] Admin이 Task 큐에 추가
✓ 2개 Task가 큐에 추가되었습니다.

[Step 3] Admin이 큐 상태 확인
ℹ 큐 상태: Pending=2, Processing=0, Completed=0, Failed=0

[Step 4] Worker가 다음 Task 요청
✓ Worker: Task 할당됨 (ID: abc-123, Prompt: "Test workflow...")

...

╔════════════════════════════════════════════════════════════╗
║              🎉 전체 워크플로우 테스트 성공! 🎉           ║
╚════════════════════════════════════════════════════════════╝

✓ Admin이 Task를 추가했습니다.
✓ Worker가 Task를 할당받았습니다.
✓ Worker가 Presigned URL을 사용했습니다.
✓ Worker가 Heartbeat를 전송했습니다.
✓ Worker가 완료 보고를 했습니다.
✓ Admin이 상태를 확인했습니다.

모든 API가 정상적으로 동작합니다!
```

---

## 문제 해결

### 문제 1: "WORKER_API_KEY not configured"

**원인:** `.env.local`에 WORKER_API_KEY가 없습니다.

**해결:**
```bash
# .env.local 파일에 추가
WORKER_API_KEY=i39dg0edinw0d98ghjwlekigfhjuwe0dignjwopdi9ghslaiq
```

### 문제 2: "Admin JWT 검증 실패"

**원인:** Admin 토큰이 만료되었거나 잘못되었습니다.

**해결:**
1. Admin 페이지에서 다시 로그인
2. 새 토큰을 발급받아 사용

### 문제 3: "할당 가능한 Task가 없습니다"

**원인:** 큐에 pending 상태의 Task가 없습니다.

**해결:**
1. Admin 페이지에서 Task를 먼저 추가하세요.
2. 또는 `test:admin` 스크립트를 먼저 실행하세요.

### 문제 4: "그룹을 찾을 수 없습니다"

**원인:** 잘못된 GROUP_ID를 입력했습니다.

**해결:**
1. Admin 대시보드에서 올바른 Group ID 확인
2. URL 또는 그룹 정보 카드에서 ID 복사

### 문제 5: "그룹에 사진이 없습니다"

**원인:** 테스트할 그룹에 사진이 업로드되지 않았습니다.

**해결:**
1. 사용자 페이지에서 해당 그룹에 사진 업로드
2. 또는 다른 그룹 ID 사용

### 문제 6: HTTP 연결 오류

**원인:** 개발 서버가 실행되지 않았습니다.

**해결:**
```bash
npm run dev
```

---

## 추가 정보

### 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `NEXT_PUBLIC_APP_URL` | API 서버 URL | `http://localhost:3000` |
| `WORKER_API_KEY` | Worker 인증 키 | `.env.local`에서 로드 |
| `ADMIN_TOKEN` | Admin JWT 토큰 | 수동 입력 필요 |
| `GROUP_ID` | 테스트할 그룹 ID | 수동 입력 필요 |

### 테스트 데이터 정리

테스트 스크립트는 실제 데이터를 생성합니다. 테스트 후 정리하려면:

1. Admin 페이지에서 테스트로 생성된 Task 확인
2. 필요시 Supabase Dashboard에서 직접 삭제:
   ```sql
   DELETE FROM video_items WHERE prompt LIKE 'Test%';
   ```

---

## 도움이 필요하신가요?

문제가 계속되면:
1. 콘솔 로그 확인 (빨간색 오류 메시지)
2. 개발자 도구 Network 탭에서 실제 API 응답 확인
3. Supabase Dashboard에서 데이터베이스 상태 확인
