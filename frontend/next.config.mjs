// frontend/next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ✅ [핵심] Rewrites 설정 (API 프록시)
  async rewrites() {
    return [
      {
        source: '/api/chat/:path*', // 프론트에서 이 주소로 보내면
        destination: 'http://localhost:3008/chat/:path*', // 백엔드의 여기로 연결됨
      },
    ];
  },
};

export default nextConfig;
