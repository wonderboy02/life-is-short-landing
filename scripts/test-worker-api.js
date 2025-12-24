/**
 * Worker API 테스트 스크립트
 *
 * 사용법:
 * node scripts/test-worker-api.js
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const WORKER_API_KEY = process.env.WORKER_API_KEY || 'i39dg0edinw0d98ghjwlekigfhjuwe0dignjwopdi9ghslaiq';
const WORKER_ID = 'test-worker-' + Date.now();

// 색상 출력 헬퍼
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

// 테스트 결과 저장
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
};

async function testAPI(name, fn) {
  testResults.total++;
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`테스트: ${name}`, 'blue');
  log('='.repeat(60), 'blue');

  try {
    await fn();
    testResults.passed++;
    logSuccess(`${name} 테스트 통과`);
    return true;
  } catch (error) {
    testResults.failed++;
    logError(`${name} 테스트 실패: ${error.message}`);
    console.error(error);
    return false;
  }
}

// ===== Worker API 테스트 =====

async function testWorkerAuth() {
  await testAPI('Worker 인증 실패 테스트', async () => {
    const response = await fetch(`${BASE_URL}/api/worker/next-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Worker wrong-key',
      },
      body: JSON.stringify({ worker_id: WORKER_ID }),
    });

    if (response.status !== 401) {
      throw new Error(`예상: 401, 실제: ${response.status}`);
    }

    logInfo('잘못된 API Key로 401 응답 확인');
  });

  await testAPI('Worker 인증 성공 테스트', async () => {
    const response = await fetch(`${BASE_URL}/api/worker/next-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Worker ${WORKER_API_KEY}`,
      },
      body: JSON.stringify({ worker_id: WORKER_ID }),
    });

    if (!response.ok && response.status !== 200) {
      throw new Error(`예상: 200, 실제: ${response.status}`);
    }

    const data = await response.json();
    logInfo(`응답: ${JSON.stringify(data, null, 2)}`);
  });
}

async function testNextTask() {
  return await testAPI('Next Task API', async () => {
    const response = await fetch(`${BASE_URL}/api/worker/next-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Worker ${WORKER_API_KEY}`,
      },
      body: JSON.stringify({
        worker_id: WORKER_ID,
        lease_duration_seconds: 600,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(error)}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(`API 실패: ${result.error}`);
    }

    if (result.data === null) {
      logWarning('할당 가능한 Task가 없습니다. 먼저 Admin에서 Task를 추가하세요.');
      return null;
    }

    logInfo(`할당된 Task ID: ${result.data.item_id}`);
    logInfo(`Photo ID: ${result.data.photo_id}`);
    logInfo(`Prompt: ${result.data.prompt}`);
    logInfo(`Leased Until: ${result.data.leased_until}`);

    return result.data;
  });
}

async function testPresignDownload(storagePath) {
  await testAPI('Presign Download API', async () => {
    const response = await fetch(`${BASE_URL}/api/worker/presign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Worker ${WORKER_API_KEY}`,
      },
      body: JSON.stringify({
        operation: 'download',
        storage_path: storagePath || 'test/dummy.jpg',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(error)}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(`API 실패: ${result.error}`);
    }

    logInfo(`Download URL 생성 성공 (${result.data.expires_in}초 유효)`);
    logInfo(`URL: ${result.data.url.substring(0, 100)}...`);
  });
}

async function testPresignUpload(itemId) {
  await testAPI('Presign Upload API', async () => {
    const response = await fetch(`${BASE_URL}/api/worker/presign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Worker ${WORKER_API_KEY}`,
      },
      body: JSON.stringify({
        operation: 'upload',
        video_item_id: itemId || 'test-item-id',
        file_extension: 'mp4',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(error)}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(`API 실패: ${result.error}`);
    }

    logInfo(`Upload URL 생성 성공 (${result.data.expires_in}초 유효)`);
    logInfo(`Storage Path: ${result.data.storage_path}`);
    logInfo(`URL: ${result.data.url.substring(0, 100)}...`);
  });
}

async function testHeartbeat(itemId, workerId) {
  await testAPI('Heartbeat API', async () => {
    const response = await fetch(`${BASE_URL}/api/worker/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Worker ${WORKER_API_KEY}`,
      },
      body: JSON.stringify({
        item_id: itemId,
        worker_id: workerId,
        extend_seconds: 300,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(error)}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(`API 실패: ${result.error}`);
    }

    logInfo(`Lease 연장 성공: ${result.data.leased_until}`);
  });
}

async function testReportCompleted(itemId, workerId) {
  await testAPI('Report Completed API', async () => {
    const response = await fetch(`${BASE_URL}/api/worker/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Worker ${WORKER_API_KEY}`,
      },
      body: JSON.stringify({
        item_id: itemId,
        worker_id: workerId,
        status: 'completed',
        video_storage_path: `videos/${itemId}.mp4`,
        veo_operation_id: 'test-operation-123',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(error)}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(`API 실패: ${result.error}`);
    }

    logInfo(`Task 완료 보고 성공`);
  });
}

async function testReportFailed(itemId, workerId) {
  await testAPI('Report Failed API', async () => {
    const response = await fetch(`${BASE_URL}/api/worker/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Worker ${WORKER_API_KEY}`,
      },
      body: JSON.stringify({
        item_id: itemId,
        worker_id: workerId,
        status: 'failed',
        error_message: '테스트 에러 메시지',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(error)}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(`API 실패: ${result.error}`);
    }

    logInfo(`Task 실패 보고 성공`);
  });
}

// ===== 메인 실행 =====

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║          Worker API 테스트 스크립트 시작                 ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  logInfo(`Base URL: ${BASE_URL}`);
  logInfo(`Worker ID: ${WORKER_ID}`);
  logInfo(`API Key: ${WORKER_API_KEY.substring(0, 10)}...`);

  // 1. 인증 테스트
  await testWorkerAuth();

  // 2. Next Task 테스트
  const taskData = await testNextTask();

  if (taskData) {
    // Task가 할당된 경우에만 후속 테스트 진행
    const { item_id, photo_storage_path } = taskData;

    // 3. Presign 테스트
    await testPresignDownload(photo_storage_path);
    await testPresignUpload(item_id);

    // 4. Heartbeat 테스트
    await testHeartbeat(item_id, WORKER_ID);

    // 5. Report 테스트 (주의: 실제 Task 상태를 변경함)
    logWarning('\n⚠️  다음 테스트는 실제 Task 상태를 변경합니다!');
    logWarning('계속하려면 Ctrl+C로 중단하거나 5초 대기...\n');

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Completed 테스트
    await testReportCompleted(item_id, WORKER_ID);

    // 또 다른 Task로 Failed 테스트
    logInfo('\nFailed 테스트를 위해 새로운 Task 할당 시도...');
    const taskData2 = await testNextTask();
    if (taskData2) {
      await testReportFailed(taskData2.item_id, WORKER_ID);
    }
  } else {
    logWarning('\n⚠️  할당 가능한 Task가 없어 일부 테스트를 건너뜁니다.');
    logWarning('Admin 페이지에서 Task를 먼저 추가하세요.');

    // Task 없이도 테스트 가능한 것들
    await testPresignDownload('test/dummy.jpg');
    await testPresignUpload('test-item-id');
  }

  // 결과 출력
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    테스트 결과 요약                        ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  log(`총 테스트: ${testResults.total}`, 'blue');
  logSuccess(`통과: ${testResults.passed}`);
  if (testResults.failed > 0) {
    logError(`실패: ${testResults.failed}`);
  }

  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  log(`\n성공률: ${successRate}%\n`, successRate === '100.0' ? 'green' : 'yellow');

  process.exit(testResults.failed > 0 ? 1 : 0);
}

main().catch((error) => {
  logError(`치명적 오류: ${error.message}`);
  console.error(error);
  process.exit(1);
});
