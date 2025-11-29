import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('main')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getMainData() {
    return {
      welcomeMessage: 'Welcome to AlphaCar Home',
      
      // [추가] 검색창 관련 데이터
      // 프론트엔드는 이 데이터가 있으면 검색창을 렌더링하게 됩니다.
      searchBar: {
        isShow: true,
        placeholder: '찾는 차량을 검색해 주세요' 
      },

      banners: [
        { id: 1, text: '11월의 핫딜: 아반떼 즉시 출고', color: '#ff5555' },
        { id: 2, text: '겨울철 타이어 교체 가이드', color: '#5555ff' }
      ],
      shortcuts: ['견적내기', '시승신청', '이벤트']
    };
  }
}
