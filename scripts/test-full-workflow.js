/**
 * 전체 워크플로우 통합 테스트 스크립트
 *
 * Admin이 Task를 추가하고 → Worker가 처리하는 전체 흐름을 테스트합니다.
 *
 * 사용법:
 * ADMIN_TOKEN=<token> GROUP_ID=<group-id> node scripts/test-full-workflow.js
 */

const readline = require('readline');

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
  magenta: '\x1b[35m',
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

function logStep(step, message) {
  log(`\n[${'Step ' + step}] ${message}`, 'magenta');
}

function question(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== Admin API =====

async function adminAddTask(adminToken, groupId, photoId, prompt, repeatCount) {
  logInfo(`Admin: Task 추가 중... (photo: ${photoId}, prompt: "${prompt}", repeat: ${repeatCount})`);

  const response = await fetch(`${BASE_URL}/api/admin/tasks/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      group_id: groupId,
      tasks: [{
        photo_id: photoId,
        prompt: prompt,
        repeat_count: repeatCount,
      }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Task 추가 실패: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(`Task 추가 실패: ${result.error}`);
  }

  logSuccess(`${result.data.total_items_added}개 Task가 큐에 추가되었습니다.`);
  return result.data;
}

async function adminCheckQueue(adminToken) {
  logInfo('Admin: 큐 상태 확인 중...');

  const response = await fetch(`${BASE_URL}/api/admin/tasks/queue`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`큐 조회 실패: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(`큐 조회 실패: ${result.error}`);
  }

  logInfo(`큐 상태: Pending=${result.data.stats.pending}, Processing=${result.data.stats.processing}, Completed=${result.data.stats.completed}, Failed=${result.data.stats.failed}`);

  return result.data;
}

async function adminCheckGroupTasks(adminToken, groupId) {
  logInfo(`Admin: 그룹 Task 확인 중... (Group: ${groupId})`);

  const response = await fetch(`${BASE_URL}/api/admin/groups/${groupId}/tasks`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`그룹 Task 조회 실패: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(`그룹 Task 조회 실패: ${result.error}`);
  }

  logInfo(`그룹 Task: Total=${result.data.stats.total}, Photos=${result.data.photos.length}`);

  return result.data;
}

async function getGroupPhotos(adminToken, groupId) {
  const response = await fetch(`${BASE_URL}/api/admin/groups/${groupId}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`그룹 조회 실패: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success || !result.data) {
    throw new Error('그룹 데이터를 가져올 수 없습니다.');
  }

  return result.data.photos;
}

// ===== Worker API =====

async function workerGetNextTask(workerId) {
  logInfo(`Worker: 다음 Task 요청 중... (Worker ID: ${workerId})`);

  const response = await fetch(`${BASE_URL}/api/worker/next-task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Worker ${WORKER_API_KEY}`,
    },
    body: JSON.stringify({
      worker_id: workerId,
      lease_duration_seconds: 600,
    }),
  });

  if (!response.ok) {
    throw new Error(`next-task 실패: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(`next-task 실패: ${result.error}`);
  }

  if (result.data === null) {
    logWarning('Worker: 할당 가능한 Task가 없습니다.');
    return null;
  }

  logSuccess(`Worker: Task 할당됨 (ID: ${result.data.item_id}, Prompt: "${result.data.prompt}")`);
  return result.data;
}

async function workerGetPresignedUrl(operation, storagePath, itemId) {
  logInfo(`Worker: Presigned URL 요청 중... (operation: ${operation})`);

  const body = operation === 'download'
    ? { operation, storage_path: storagePath }
    : { operation, video_item_id: itemId, file_extension: 'mp4' };

  const response = await fetch(`${BASE_URL}/api/worker/presign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Worker ${WORKER_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`presign 실패: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(`presign 실패: ${result.error}`);
  }

  logSuccess(`Worker: ${operation} URL 발급 성공 (유효: ${result.data.expires_in}초)`);
  return result.data;
}

async function workerSendHeartbeat(itemId, workerId) {
  logInfo(`Worker: Heartbeat 전송 중... (Task: ${itemId})`);

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
    throw new Error(`heartbeat 실패: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(`heartbeat 실패: ${result.error}`);
  }

  logSuccess(`Worker: Heartbeat 성공 (Lease until: ${result.data.leased_until})`);
}

async function workerReportCompleted(itemId, workerId, videoPath) {
  logInfo(`Worker: Task 완료 보고 중... (Task: ${itemId})`);

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
      video_storage_path: videoPath,
      veo_operation_id: 'test-op-' + Date.now(),
    }),
  });

  if (!response.ok) {
    throw new Error(`report 실패: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(`report 실패: ${result.error}`);
  }

  logSuccess(`Worker: Task 완료 보고 성공`);
}

// ===== 메인 워크플로우 =====

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║       전체 워크플로우 통합 테스트 시작                   ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  // 입력받기
  let adminToken = process.env.ADMIN_TOKEN;
  let groupId = process.env.GROUP_ID;

  if (!adminToken) {
    logWarning('ADMIN_TOKEN 환경변수가 설정되지 않았습니다.\n');
    adminToken = await question('Admin Token 입력: ');
  }

  if (!groupId) {
    logWarning('GROUP_ID 환경변수가 설정되지 않았습니다.\n');
    groupId = await question('Group ID 입력: ');
  }

  logInfo(`Base URL: ${BASE_URL}`);
  logInfo(`Worker ID: ${WORKER_ID}`);
  logInfo(`Group ID: ${groupId}\n`);

  try {
    // Step 1: 그룹의 사진 가져오기
    logStep(1, '그룹의 사진 목록 가져오기');
    const photos = await getGroupPhotos(adminToken, groupId);

    if (photos.length === 0) {
      throw new Error('그룹에 사진이 없습니다. 먼저 사진을 업로드하세요.');
    }

    logSuccess(`${photos.length}개의 사진 발견`);
    const firstPhoto = photos[0];
    logInfo(`첫 번째 사진 사용: ${firstPhoto.id}`);

    // Step 2: Admin이 Task 추가
    logStep(2, 'Admin이 Task 큐에 추가');
    const prompt = `Test workflow - ${new Date().toISOString()}`;
    await adminAddTask(adminToken, groupId, firstPhoto.id, prompt, 2);

    await sleep(1000);

    // Step 3: Admin이 큐 상태 확인
    logStep(3, 'Admin이 큐 상태 확인');
    await adminCheckQueue(adminToken);
    await adminCheckGroupTasks(adminToken, groupId);

    await sleep(1000);

    // Step 4: Worker가 Task 가져오기
    logStep(4, 'Worker가 다음 Task 요청');
    const task = await workerGetNextTask(WORKER_ID);

    if (!task) {
      throw new Error('Worker가 Task를 받지 못했습니다.');
    }

    await sleep(1000);

    // Step 5: Worker가 입력 이미지 다운로드 URL 받기
    logStep(5, 'Worker가 입력 이미지 다운로드 URL 요청');
    await workerGetPresignedUrl('download', task.photo_storage_path);

    await sleep(1000);

    // Step 6: Worker가 추론 시뮬레이션 (Heartbeat 포함)
    logStep(6, 'Worker가 추론 시뮬레이션 (5초)');
    logInfo('추론 중...');
    await sleep(2000);

    await workerSendHeartbeat(task.item_id, WORKER_ID);
    logInfo('계속 추론 중...');
    await sleep(3000);

    // Step 7: Worker가 결과 업로드 URL 받기
    logStep(7, 'Worker가 결과 비디오 업로드 URL 요청');
    const uploadData = await workerGetPresignedUrl('upload', null, task.item_id);

    await sleep(1000);

    // Step 8: Worker가 완료 보고
    logStep(8, 'Worker가 Task 완료 보고');
    await workerReportCompleted(task.item_id, WORKER_ID, uploadData.storage_path);

    await sleep(1000);

    // Step 9: Admin이 최종 상태 확인
    logStep(9, 'Admin이 최종 상태 확인');
    await adminCheckQueue(adminToken);
    await adminCheckGroupTasks(adminToken, groupId);

    // Step 10: 두 번째 Task 처리 (repeat_count=2이므로)
    logStep(10, 'Worker가 두 번째 Task 처리');
    const task2 = await workerGetNextTask(WORKER_ID);

    if (task2) {
      logInfo('두 번째 Task 발견, 빠르게 처리...');
      await workerGetPresignedUrl('download', task2.photo_storage_path);
      await sleep(1000);
      const uploadData2 = await workerGetPresignedUrl('upload', null, task2.item_id);
      await workerReportCompleted(task2.item_id, WORKER_ID, uploadData2.storage_path);

      await sleep(1000);

      logStep(11, 'Admin이 모든 Task 완료 후 최종 확인');
      await adminCheckQueue(adminToken);
      await adminCheckGroupTasks(adminToken, groupId);
    }

    // 성공!
    log('\n╔════════════════════════════════════════════════════════════╗', 'green');
    log('║              🎉 전체 워크플로우 테스트 성공! 🎉           ║', 'green');
    log('╚════════════════════════════════════════════════════════════╝\n', 'green');

    logSuccess('Admin이 Task를 추가했습니다.');
    logSuccess('Worker가 Task를 할당받았습니다.');
    logSuccess('Worker가 Presigned URL을 사용했습니다.');
    logSuccess('Worker가 Heartbeat를 전송했습니다.');
    logSuccess('Worker가 완료 보고를 했습니다.');
    logSuccess('Admin이 상태를 확인했습니다.');

    log('\n모든 API가 정상적으로 동작합니다!\n', 'green');

  } catch (error) {
    log('\n╔════════════════════════════════════════════════════════════╗', 'red');
    log('║                   ⚠️  테스트 실패  ⚠️                     ║', 'red');
    log('╚════════════════════════════════════════════════════════════╝\n', 'red');

    logError(`오류: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

main().catch((error) => {
  logError(`치명적 오류: ${error.message}`);
  console.error(error);
  process.exit(1);
});
