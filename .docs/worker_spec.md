# WAN Worker 구현 스펙 (Vast GPU)

## 📋 목차

- [개요](#개요)
- [아키텍처](#아키텍처)
- [인증](#인증)
- [API 엔드포인트](#api-엔드포인트)
- [워크플로우](#워크플로우)
- [데이터 스키마](#데이터-스키마)
- [에러 처리](#에러-처리)
- [환경 변수](#환경-변수)
- [예제 코드](#예제-코드)

---

## 개요

### 목적
Vercel에서 호스팅되는 Admin 페이지에서 추가한 이미지 추론 Task를 Vast GPU 워커가 자동으로 처리합니다.

### 핵심 원칙
- **Pull 방식**: Worker가 Vercel API를 폴링하여 Task를 가져옴 (Admin이 Worker에 푸시하지 않음)
- **보안**: Worker는 Supabase에 직접 접근 불가, Presigned URL만 사용
- **장애 복구**: Lease 메커니즘으로 Worker 장애 시 자동 재할당

---

## 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                         Vercel                              │
│  ┌──────────────┐       ┌─────────────┐                    │
│  │  Admin UI    │──────▶│  Worker API │                    │
│  │ (Task 추가)  │       │             │                    │
│  └──────────────┘       └─────────────┘                    │
│                               │                              │
│                               │ Presigned URL 발급           │
│                               ▼                              │
│                         ┌──────────┐                        │
│                         │ Supabase │                        │
│                         │ Storage  │                        │
│                         └──────────┘                        │
└─────────────────────────────────────────────────────────────┘
                                ▲
                                │ Presigned URL로
                                │ 파일 다운로드/업로드
                                │
                      ┌─────────┴─────────┐
                      │   Vast GPU Worker │
                      │                   │
                      │  ┌──────────────┐ │
                      │  │ WAN 추론     │ │
                      │  └──────────────┘ │
                      └───────────────────┘
```

### 데이터 흐름
1. Admin이 Vercel API로 Task 추가 → Supabase DB에 저장
2. Worker가 Vercel API 폴링 → 다음 Task 할당받음
3. Worker가 Presigned URL 요청 → 입력 이미지 다운로드
4. Worker가 WAN 추론 실행 (5-10분)
5. Worker가 Presigned URL 요청 → 결과 비디오 업로드
6. Worker가 완료 보고 → Task 상태 업데이트

---

## 인증

### API Key 방식

**헤더 형식:**
```
Authorization: Worker <API_KEY>
```

**예시:**
```bash
curl -X POST https://your-domain.com/api/worker/next-task \
  -H "Authorization: Worker i39dg0edinw0d98ghjwlekigfhjuwe0dignjwopdi9ghslaiq" \
  -H "Content-Type: application/json" \
  -d '{"worker_id": "worker-001"}'
```

**주의사항:**
- API Key는 환경변수로 관리 (코드에 하드코딩 금지)
- 모든 Worker API 호출 시 필수

---

## API 엔드포인트

### Base URL
- 개발: `http://localhost:3000`
- 프로덕션: `https://your-domain.vercel.app`

---

### 1. Next Task 요청

다음 처리할 Task를 할당받습니다.

**Endpoint:** `POST /api/worker/next-task`

**Request:**
```json
{
  "worker_id": "worker-001",
  "lease_duration_seconds": 600
}
```

**Parameters:**
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `worker_id` | string | ✅ | Worker 고유 식별자 (UUID 권장) |
| `lease_duration_seconds` | number | ❌ | Lease 시간 (기본: 600초 = 10분) |

**Response (Task 있음):**
```json
{
  "success": true,
  "data": {
    "item_id": "142193c7-a29c-42a9-82ea-e0257ac1ea42",
    "group_id": "bffe9c88-1f8e-4fa6-b169-20da1cdc8c0e",
    "photo_id": "9ddda234-09d3-4de7-a12e-bf69a661b9c1",
    "prompt": "happy family moment",
    "leased_until": "2025-12-24T05:59:57.098Z",
    "photo_storage_path": "group-id/photo-id_original.png"
  }
}
```

**Response (Task 없음):**
```json
{
  "success": true,
  "data": null
}
```

**동작:**
- DB에서 `status=pending` 또는 `status=processing AND leased_until < NOW()` 인 Task 1개 선택
- `retry_count < 3` 인 Task만 할당
- 원자적(atomic) 업데이트로 동시성 제어
- 할당된 Task는 `status=processing`으로 변경

---

### 2. Presigned URL 발급

Supabase Storage 접근을 위한 단기 URL 발급

**Endpoint:** `POST /api/worker/presign`

#### 2-1. 입력 이미지 다운로드 URL

**Request:**
```json
{
  "operation": "download",
  "storage_path": "group-id/photo-id_original.png"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://knxpbilyfdykcrxgzdcr.supabase.co/storage/v1/object/sign/...",
    "expires_in": 3600
  }
}
```

#### 2-2. 결과 비디오 업로드 URL

**Request:**
```json
{
  "operation": "upload",
  "video_item_id": "142193c7-a29c-42a9-82ea-e0257ac1ea42",
  "file_extension": "mp4"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://knxpbilyfdykcrxgzdcr.supabase.co/storage/v1/object/upload/...",
    "expires_in": 3600,
    "storage_path": "videos/142193c7-a29c-42a9-82ea-e0257ac1ea42.mp4"
  }
}
```

**주의:**
- URL은 1시간(3600초) 후 만료
- 만료 전에 다운로드/업로드 완료 필요

---

### 3. Heartbeat (Lease 연장)

장시간 작업 시 Lease를 연장합니다.

**Endpoint:** `POST /api/worker/heartbeat`

**Request:**
```json
{
  "item_id": "142193c7-a29c-42a9-82ea-e0257ac1ea42",
  "worker_id": "worker-001",
  "extend_seconds": 300
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "leased_until": "2025-12-24T06:05:00.000Z"
  }
}
```

**사용 시점:**
- 추론이 5분 이상 걸릴 것으로 예상될 때
- 2-3분마다 백그라운드 스레드에서 호출 권장

---

### 4. 결과 보고

Task 처리 완료/실패를 보고합니다.

**Endpoint:** `POST /api/worker/report`

#### 4-1. 성공 보고

**Request:**
```json
{
  "item_id": "142193c7-a29c-42a9-82ea-e0257ac1ea42",
  "worker_id": "worker-001",
  "status": "completed",
  "video_storage_path": "videos/142193c7-a29c-42a9-82ea-e0257ac1ea42.mp4",
  "veo_operation_id": "optional-tracking-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Task completed",
    "item_id": "142193c7-a29c-42a9-82ea-e0257ac1ea42"
  }
}
```

#### 4-2. 실패 보고

**Request:**
```json
{
  "item_id": "142193c7-a29c-42a9-82ea-e0257ac1ea42",
  "worker_id": "worker-001",
  "status": "failed",
  "error_message": "GPU out of memory"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Task failed",
    "item_id": "142193c7-a29c-42a9-82ea-e0257ac1ea42"
  }
}
```

**동작:**
- 성공 시: `status=completed`, 다운로드 URL 자동 생성
- 실패 시: `status=failed`, `retry_count` 증가
- `retry_count >= 3` 이면 재할당 안 됨

---

## 워크플로우

### 기본 처리 루프

```python
import requests
import time
from uuid import uuid4

BASE_URL = "https://your-domain.vercel.app"
API_KEY = "your-worker-api-key"
WORKER_ID = str(uuid4())

def get_headers():
    return {
        "Content-Type": "application/json",
        "Authorization": f"Worker {API_KEY}"
    }

while True:
    # 1. 다음 Task 요청
    response = requests.post(
        f"{BASE_URL}/api/worker/next-task",
        json={"worker_id": WORKER_ID, "lease_duration_seconds": 600},
        headers=get_headers()
    )

    result = response.json()

    if not result["success"] or result["data"] is None:
        print("No tasks available, waiting...")
        time.sleep(10)
        continue

    task = result["data"]
    item_id = task["item_id"]
    photo_storage_path = task["photo_storage_path"]
    prompt = task["prompt"]

    try:
        # 2. 입력 이미지 다운로드 URL 받기
        presign_response = requests.post(
            f"{BASE_URL}/api/worker/presign",
            json={"operation": "download", "storage_path": photo_storage_path},
            headers=get_headers()
        )
        download_url = presign_response.json()["data"]["url"]

        # 3. 이미지 다운로드
        image_data = requests.get(download_url).content

        # 4. WAN 추론 실행
        video_data = run_wan_inference(image_data, prompt)

        # 5. 비디오 업로드 URL 받기
        upload_presign = requests.post(
            f"{BASE_URL}/api/worker/presign",
            json={"operation": "upload", "video_item_id": item_id, "file_extension": "mp4"},
            headers=get_headers()
        )
        upload_url = upload_presign.json()["data"]["url"]
        storage_path = upload_presign.json()["data"]["storage_path"]

        # 6. 비디오 업로드
        requests.put(upload_url, data=video_data, headers={"Content-Type": "video/mp4"})

        # 7. 완료 보고
        requests.post(
            f"{BASE_URL}/api/worker/report",
            json={
                "item_id": item_id,
                "worker_id": WORKER_ID,
                "status": "completed",
                "video_storage_path": storage_path
            },
            headers=get_headers()
        )

        print(f"Task {item_id} completed successfully")

    except Exception as e:
        # 실패 보고
        requests.post(
            f"{BASE_URL}/api/worker/report",
            json={
                "item_id": item_id,
                "worker_id": WORKER_ID,
                "status": "failed",
                "error_message": str(e)
            },
            headers=get_headers()
        )

        print(f"Task {item_id} failed: {e}")
```

### Heartbeat 처리 (장시간 작업용)

```python
import threading

def send_heartbeat(item_id, worker_id):
    """백그라운드에서 주기적으로 heartbeat 전송"""
    while heartbeat_active:
        time.sleep(120)  # 2분마다
        try:
            requests.post(
                f"{BASE_URL}/api/worker/heartbeat",
                json={"item_id": item_id, "worker_id": worker_id, "extend_seconds": 300},
                headers=get_headers()
            )
        except:
            pass

# 추론 시작 전
heartbeat_active = True
heartbeat_thread = threading.Thread(target=send_heartbeat, args=(item_id, WORKER_ID))
heartbeat_thread.daemon = True
heartbeat_thread.start()

# 추론 실행
video_data = run_wan_inference(image_data, prompt)

# 추론 완료 후
heartbeat_active = False
```

---

## 데이터 스키마

### video_items 테이블

Worker가 직접 접근하지는 않지만, 참고용으로 제공합니다.

```sql
CREATE TABLE video_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Task 정보
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,

  -- 상태 관리
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  -- Worker 할당
  worker_id TEXT,
  leased_until TIMESTAMPTZ,

  -- 결과
  generated_video_url TEXT,
  veo_operation_id TEXT,

  -- 에러 처리
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,

  -- 타임스탬프
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 인덱스
  INDEX idx_video_items_status (status),
  INDEX idx_video_items_leased_until (leased_until) WHERE status = 'processing'
);
```

### 상태 전이도

```
pending ──────┐
              ├─▶ processing ──┬─▶ completed
              │                └─▶ failed (retry_count < 3 이면 → pending)
              │
lease 만료 ───┘
```

---

## 에러 처리

### HTTP 에러 코드

| 코드 | 의미 | 조치 |
|------|------|------|
| `200` | 성공 | - |
| `400` | 잘못된 요청 | 파라미터 확인 |
| `401` | 인증 실패 | API Key 확인 |
| `404` | Task/리소스 없음 | - |
| `500` | 서버 오류 | 재시도 후 보고 |

### 재시도 전략

**권장 정책:**
- API 호출 실패 시: 지수 백오프 (1초, 2초, 4초...)
- Task 처리 실패 시: `status=failed` 보고 (자동 재할당됨)
- 네트워크 단절 시: Lease 만료 후 자동 재할당

**중요:**
- Worker 크래시 시에도 Lease 만료 후 다른 Worker가 처리
- `retry_count >= 3` 이면 더 이상 재할당 안 됨

---

## 환경 변수

```bash
# Worker 설정
WORKER_API_KEY=i39dg0edinw0d98ghjwlekigfhjuwe0dignjwopdi9ghslaiq
VERCEL_API_URL=https://your-domain.vercel.app

# Worker ID (선택: 없으면 UUID 자동 생성)
WORKER_ID=vast-worker-001

# 폴링 간격 (초)
POLL_INTERVAL=10

# Lease 시간 (초)
LEASE_DURATION=600

# Heartbeat 간격 (초)
HEARTBEAT_INTERVAL=120
```

---

## 예제 코드

### Python (완전한 예제)

```python
import requests
import time
import threading
from uuid import uuid4
from typing import Optional, Dict, Any

class WANWorker:
    def __init__(self, api_url: str, api_key: str, worker_id: Optional[str] = None):
        self.api_url = api_url.rstrip('/')
        self.api_key = api_key
        self.worker_id = worker_id or str(uuid4())
        self.heartbeat_active = False

    def _get_headers(self) -> Dict[str, str]:
        return {
            "Content-Type": "application/json",
            "Authorization": f"Worker {self.api_key}"
        }

    def get_next_task(self) -> Optional[Dict[str, Any]]:
        """다음 Task 요청"""
        response = requests.post(
            f"{self.api_url}/api/worker/next-task",
            json={
                "worker_id": self.worker_id,
                "lease_duration_seconds": 600
            },
            headers=self._get_headers()
        )
        response.raise_for_status()
        result = response.json()
        return result.get("data")

    def get_presigned_url(self, operation: str, **kwargs) -> Dict[str, Any]:
        """Presigned URL 요청"""
        payload = {"operation": operation, **kwargs}
        response = requests.post(
            f"{self.api_url}/api/worker/presign",
            json=payload,
            headers=self._get_headers()
        )
        response.raise_for_status()
        return response.json()["data"]

    def send_heartbeat(self, item_id: str, extend_seconds: int = 300):
        """Heartbeat 전송"""
        response = requests.post(
            f"{self.api_url}/api/worker/heartbeat",
            json={
                "item_id": item_id,
                "worker_id": self.worker_id,
                "extend_seconds": extend_seconds
            },
            headers=self._get_headers()
        )
        response.raise_for_status()

    def report_result(self, item_id: str, status: str, **kwargs):
        """결과 보고 (completed/failed)"""
        response = requests.post(
            f"{self.api_url}/api/worker/report",
            json={
                "item_id": item_id,
                "worker_id": self.worker_id,
                "status": status,
                **kwargs
            },
            headers=self._get_headers()
        )
        response.raise_for_status()

    def _heartbeat_loop(self, item_id: str):
        """백그라운드 heartbeat 루프"""
        while self.heartbeat_active:
            time.sleep(120)  # 2분마다
            if not self.heartbeat_active:
                break
            try:
                self.send_heartbeat(item_id)
                print(f"Heartbeat sent for task {item_id}")
            except Exception as e:
                print(f"Heartbeat failed: {e}")

    def process_task(self, task: Dict[str, Any]):
        """Task 처리"""
        item_id = task["item_id"]
        photo_storage_path = task["photo_storage_path"]
        prompt = task["prompt"]

        print(f"Processing task {item_id}: {prompt}")

        # Heartbeat 시작
        self.heartbeat_active = True
        heartbeat_thread = threading.Thread(target=self._heartbeat_loop, args=(item_id,))
        heartbeat_thread.daemon = True
        heartbeat_thread.start()

        try:
            # 1. 입력 이미지 다운로드
            download_data = self.get_presigned_url("download", storage_path=photo_storage_path)
            image_response = requests.get(download_data["url"])
            image_response.raise_for_status()
            image_data = image_response.content

            # 2. WAN 추론 실행
            video_data = self.run_wan_inference(image_data, prompt)

            # 3. 비디오 업로드
            upload_data = self.get_presigned_url(
                "upload",
                video_item_id=item_id,
                file_extension="mp4"
            )
            upload_response = requests.put(
                upload_data["url"],
                data=video_data,
                headers={"Content-Type": "video/mp4"}
            )
            upload_response.raise_for_status()

            # 4. 완료 보고
            self.report_result(
                item_id,
                "completed",
                video_storage_path=upload_data["storage_path"]
            )

            print(f"Task {item_id} completed successfully")

        except Exception as e:
            # 실패 보고
            self.report_result(
                item_id,
                "failed",
                error_message=str(e)
            )
            print(f"Task {item_id} failed: {e}")

        finally:
            # Heartbeat 중지
            self.heartbeat_active = False
            heartbeat_thread.join(timeout=1)

    def run_wan_inference(self, image_data: bytes, prompt: str) -> bytes:
        """WAN 추론 실행 (구현 필요)"""
        # TODO: 실제 WAN 모델 추론 코드
        raise NotImplementedError("WAN inference not implemented")

    def run(self, poll_interval: int = 10):
        """메인 워커 루프"""
        print(f"Worker {self.worker_id} started")

        while True:
            try:
                task = self.get_next_task()

                if task is None:
                    print("No tasks available, waiting...")
                    time.sleep(poll_interval)
                    continue

                self.process_task(task)

            except KeyboardInterrupt:
                print("Worker stopped by user")
                break
            except Exception as e:
                print(f"Unexpected error: {e}")
                time.sleep(poll_interval)

# 실행
if __name__ == "__main__":
    worker = WANWorker(
        api_url="https://your-domain.vercel.app",
        api_key="your-worker-api-key"
    )
    worker.run()
```

---

## 참고 사항

### Storage 경로 규칙

**입력 이미지:**
```
bucket: group-photos
path: {group_id}/{photo_id}_original.{ext}
예시: bffe9c88-1f8e-4fa6-b169-20da1cdc8c0e/9ddda234-09d3-4de7-a12e-bf69a661b9c1_original.png
```

**출력 비디오:**
```
bucket: generated-videos
path: videos/{video_item_id}.mp4
예시: videos/142193c7-a29c-42a9-82ea-e0257ac1ea42.mp4
```

### 성능 고려사항

- **동시 처리**: 여러 Worker를 병렬 실행 가능 (DB lock으로 동시성 제어)
- **폴링 간격**: 10초 권장 (너무 짧으면 DB 부하)
- **Lease 시간**: WAN 추론 시간(5-10분) + 여유시간 고려
- **Heartbeat**: 추론 시간이 5분 이상이면 반드시 사용

### 보안

- ✅ API Key를 환경변수로 관리
- ✅ Presigned URL 사용 (Supabase 키 불필요)
- ✅ HTTPS만 사용
- ❌ Worker에 Supabase 키 저장 금지

---

## 문의

Worker 구현 중 문제가 발생하면:
1. API 응답 에러 메시지 확인
2. Worker 로그 확인
3. Admin 페이지에서 Task 상태 확인
4. `retry_count` 및 `error_message` 확인
