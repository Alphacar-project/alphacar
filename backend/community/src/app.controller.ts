import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('community')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getCommunityPosts() {
    return {
      message: '커뮤니티 게시글 목록입니다.',
      // UI 스크린샷에 맞춰 데이터 구조를 수정했습니다.
      posts: [
        { 
          id: 1, 
          category: '구매 고민',  // 탭 필터링을 위해 필수
          title: '그랜저 하이브리드 vs G80 중에 고민입니다', 
          content: '주행거리는 연 2만km 정도이고, 패밀리카로 쓸 예정입니다.', 
          author: '익명', 
          date: '2025-11-29',
          views: 45
        },
        { 
          id: 2, 
          category: '오너 리뷰', 
          title: '쏘나타 N라인 1년 타본 솔직 후기', 
          content: '출력은 만족하지만, 승차감은 생각보다 단단한 편이에요.', 
          author: '쏘나타N오너', 
          date: '2025-11-20',
          views: 120 
        },
        { 
          id: 3, 
          category: '구매 고민', 
          title: '첫 차로 아반떼 어떤가요?', 
          content: '사회 초년생인데 유지비가 걱정됩니다.', 
          author: 'newbie', 
          date: '2025-11-28',
          views: 85 
        }
      ]
    };
  }

  @Post('write')
  createPost(@Body() body: any) {
    console.log('작성된 글:', body);
    return { success: true, message: '글이 등록되었습니다.' };
  }
}
