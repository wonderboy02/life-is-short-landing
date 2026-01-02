'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export function KakaoProvider() {
  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;

  useEffect(() => {
    // SDK 로드 후 초기화
    if (window.Kakao && !window.Kakao.isInitialized()) {
      if (kakaoKey) {
        window.Kakao.init(kakaoKey);
        console.log('Kakao SDK initialized');
      }
    }
  }, [kakaoKey]);

  return (
    <>
      <Script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
        integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={() => {
          if (kakaoKey && window.Kakao && !window.Kakao.isInitialized()) {
            window.Kakao.init(kakaoKey);
            console.log('Kakao SDK initialized');
          }
        }}
      />
    </>
  );
}
