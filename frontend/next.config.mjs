/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // 1. 기존 AI 채팅 서버 설정 (유지)
      {
        source: '/api/chat/:path*',
        destination: 'http://127.0.0.1:4000/chat/:path*', 
      },

      // 2. [견적 서비스] (포트가 다르다면 수정 필요!)
      {
        source: '/api/quote/:path*',
        // ▼ 아래 3003을 실제 견적 서비스 포트로 바꿔주세요!
        destination: 'http://192.168.0.160:3003/quote/:path*', 
      },

      // 견적함 데이터 (estimate) -> 3003번 포트
      {
        source: '/api/estimate/:path*',
        destination: 'http://192.168.0.160:3003/estimate/:path*',
      },

      // 3. [소식지 서비스]
      {
        source: '/api/news/:path*',
        // ▼ 아래 3004를 실제 커뮤니티 서비스 포트로 바꿔주세요!
        destination: 'http://192.168.0.160:3004/news/:path*', 
      },

      {
        source: '/api/community/:path*',
        destination: 'http://192.168.0.160:3005/community/:path*', 
      },
      {
        source: '/api/mypage/:path*',
        destination: 'http://192.168.0.160:3006/mypage/:path*', 
      },
      {
        source: '/api/search/:path*',
        destination: 'http://192.168.0.160:3007/search/:path*',
      },
 
      // ★ [추가] 메인 데이터 처리 (3002) - 이게 있어야 fetchMainData가 작동합니다!
      {
        source: '/api/main/:path*',
        destination: 'http://192.168.0.160:3002/main/:path*',
      },

      {
        source: '/api/makers',
        destination: 'http://192.168.0.160:3003/quote/makers',
      },

      {
        source: '/api/models',
        destination: 'http://192.168.0.160:3003/quote/models',
      },
            {
        source: '/api/trims',
        destination: 'http://192.168.0.160:3003/quote/trims',
      },

      // 2. ⭐ [지금 에러 나는 부분] 상세 조회 (detail)
      {
        source: '/api/detail',
        destination: 'http://192.168.0.160:3003/quote/detail',
      },

      // 3. [추가] 앞으로 쓰게 될 비교 데이터 관련 API (미리 추가)
      {
        source: '/api/compare-data',
        destination: 'http://192.168.0.160:3003/quote/compare-data',
      },
      {
        source: '/api/compare-details',
        destination: 'http://192.168.0.160:3003/quote/compare-details',
      },


      {
        source: '/api/quote/:path*',
        destination: 'http://192.168.0.160:3003/quote/:path*',
      },

      
      // 2. [추가] 차량 백엔드 연결 설정 (순서 중요: 맨 아래에 위치)
      {
        // 프론트엔드에서 '/api/...' 로 요청을 보내면
        source: '/api/:path*',
        // 백엔드(3002번)의 '/vehicles/...' 로 바꿔서 전달함
        destination: 'http://192.168.0.160:3002/vehicles/:path*',
      },
    ];
  },
};

export default nextConfig;
