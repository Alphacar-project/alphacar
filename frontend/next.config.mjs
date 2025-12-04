/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/chat/:path*',
        destination: 'http://127.0.0.1:4000/chat/:path*', // ✅ AI 서버 포트(4000) 확인!
      },
    ];
  },
};

export default nextConfig;
