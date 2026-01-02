import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // API Routes body size limit 증가 (20MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
}

export default withBundleAnalyzer(nextConfig);
