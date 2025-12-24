/**
 * Admin API 테스트 스크립트
 *
 * 사용법:
 * ADMIN_TOKEN=<your-token> GROUP_ID=<group-id> node scripts/test-admin-api.js
 *
 * 또는 환경변수 없이 실행하면 대화형으로 입력받습니다.
 */

const readline = require('readline');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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

// 대화형 입력 헬퍼
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

// ===== Admin API 테스트 =====

async function testAdminAuth(adminToken) {
  await testAPI('Admin 인증 실패 테스트', async () => {
    const response = await fetch(`${BASE_URL}/api/admin/tasks/queue`, {
      headers: {
        'Authorization': 'Bearer wrong-token',
      },
    });

    if (response.status !== 401) {
      throw new Error(`예상: 401, 실제: ${response.status}`);
    }

    logInfo('잘못된 토큰으로 401 응답 확인');
  });

  await testAPI('Admin 인증 성공 테스트', async () => {
    const response = await fetch(`${BASE_URL}/api/admin/tasks/queue`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`예상: 200, 실제: ${response.status}`);
    }

    logInfo('올바른 토큰으로 인증 성공');
  });
}

async function testTasksQueue(adminToken) {
  return await testAPI('Tasks Queue API', async () => {
    const response = await fetch(`${BASE_URL}/api/admin/tasks/queue`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(error)}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(`API 실패: ${result.error}`);
    }

    logInfo(`전체 통계:`);
    logInfo(`  - Total: ${result.data.stats.total}`);
    logInfo(`  - Pending: ${result.data.stats.pending}`);
    logInfo(`  - Processing: ${result.data.stats.processing}`);
    logInfo(`  - Completed: ${result.data.stats.completed}`);
    logInfo(`  - Failed: ${result.data.stats.failed}`);
    logInfo(`Task 개수: ${result.data.items.length}`);

    return result.data;
  });
}

async function testTasksQueueWithFilters(adminToken) {
  await testAPI('Tasks Queue API (Status Filter)', async () => {
    const response = await fetch(`${BASE_URL}/api/admin/tasks/queue?status=pending`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(error)}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(`API 실패: ${result.error}`);
    }

    logInfo(`Pending Task 개수: ${result.data.items.length}`);
  });
}

async function testGroupTasks(adminToken, groupId) {
  return await testAPI('Group Tasks API', async () => {
    const response = await fetch(`${BASE_URL}/api/admin/groups/${groupId}/tasks`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(error)}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(`API 실패: ${result.error}`);
    }

    logInfo(`Group ID: ${result.data.group_id}`);
    logInfo(`전체 통계:`);
    logInfo(`  - Total: ${result.data.stats.total}`);
    logInfo(`  - Pending: ${result.data.stats.pending}`);
    logInfo(`  - Processing: ${result.data.stats.processing}`);
    logInfo(`  - Completed: ${result.data.stats.completed}`);
    logInfo(`  - Failed: ${result.data.stats.failed}`);
    logInfo(`Photo 그룹 개수: ${result.data.photos.length}`);

    result.data.photos.forEach((photoGroup, index) => {
      logInfo(`  Photo ${index + 1}: ${photoGroup.tasks.length}개 task`);
    });

    return result.data;
  });
}

async function testTasksAdd(adminToken, groupId, photoIds) {
  return await testAPI('Tasks Add API', async () => {
    // 테스트용 Task 데이터 생성
    const tasks = photoIds.slice(0, 2).map((photoId, index) => ({
      photo_id: photoId,
      prompt: `Test prompt ${index + 1} - ${Date.now()}`,
      repeat_count: index + 1, // 1, 2
    }));

    const response = await fetch(`${BASE_URL}/api/admin/tasks/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        group_id: groupId,
        tasks,
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

    logInfo(`추가된 Task 개수: ${result.data.total_items_added}`);
    result.data.items.forEach((item, index) => {
      logInfo(`  Task ${index + 1}: ${item.prompt} (${item.id})`);
    });

    return result.data;
  });
}

async function getGroupPhotos(adminToken, groupId) {
  logInfo('그룹의 사진 목록을 가져오는 중...');

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

  return result.data.photos.map(photo => photo.id);
}

// ===== 메인 실행 =====

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║          Admin API 테스트 스크립트 시작                  ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  logInfo(`Base URL: ${BASE_URL}`);

  // 토큰 및 그룹 ID 입력받기
  let adminToken = process.env.ADMIN_TOKEN;
  let groupId = process.env.GROUP_ID;

  if (!adminToken) {
    logWarning('ADMIN_TOKEN 환경변수가 설정되지 않았습니다.');
    logInfo('Admin 페이지에 로그인한 후 localStorage에서 admin_token을 복사하세요.\n');
    adminToken = await question('Admin Token 입력: ');
  }

  if (!groupId) {
    logWarning('GROUP_ID 환경변수가 설정되지 않았습니다.\n');
    groupId = await question('Group ID 입력: ');
  }

  logInfo(`Admin Token: ${adminToken.substring(0, 20)}...`);
  logInfo(`Group ID: ${groupId}\n`);

  // 1. 인증 테스트
  await testAdminAuth(adminToken);

  // 2. Tasks Queue 테스트
  await testTasksQueue(adminToken);
  await testTasksQueueWithFilters(adminToken);

  // 3. Group Tasks 테스트
  const groupTasksData = await testGroupTasks(adminToken, groupId);

  // 4. Tasks Add 테스트
  if (groupTasksData && groupTasksData.photos.length > 0) {
    const photoIds = groupTasksData.photos.map(p => p.photo_id);

    logWarning('\n⚠️  다음 테스트는 실제 Task를 추가합니다!');
    logWarning('계속하려면 Enter를 누르거나 Ctrl+C로 중단...\n');

    await question('계속하려면 Enter를 누르세요: ');

    await testTasksAdd(adminToken, groupId, photoIds);

    // Task 추가 후 다시 조회
    logInfo('\nTask 추가 후 재조회...');
    await testTasksQueue(adminToken);
    await testGroupTasks(adminToken, groupId);
  } else {
    logWarning('\n⚠️  그룹에 사진이 없어 Tasks Add 테스트를 건너뜁니다.');
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
