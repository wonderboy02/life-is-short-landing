const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '../public/hero');
const SIZE = 220; // 220x220px (레티나 디스플레이 고려한 2배 크기)
const QUALITY = 80;

async function optimizeImages() {
  console.log('🖼️  이미지 최적화 시작...\n');

  for (let i = 1; i <= 9; i++) {
    const inputPath = path.join(INPUT_DIR, `${i}.jpg`);
    const outputPath = path.join(INPUT_DIR, `${i}.webp`);

    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  ${i}.jpg 파일을 찾을 수 없습니다.`);
      continue;
    }

    try {
      const inputStats = fs.statSync(inputPath);
      const inputSizeKB = (inputStats.size / 1024).toFixed(2);

      await sharp(inputPath)
        .resize(SIZE, SIZE, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: QUALITY })
        .toFile(outputPath);

      const outputStats = fs.statSync(outputPath);
      const outputSizeKB = (outputStats.size / 1024).toFixed(2);
      const reduction = (((inputStats.size - outputStats.size) / inputStats.size) * 100).toFixed(1);

      console.log(
        `✅ ${i}.jpg → ${i}.webp | ${inputSizeKB}KB → ${outputSizeKB}KB (${reduction}% 감소)`
      );
    } catch (error) {
      console.error(`❌ ${i}.jpg 처리 중 오류:`, error.message);
    }
  }

  console.log('\n✨ 이미지 최적화 완료!');
}

optimizeImages();
