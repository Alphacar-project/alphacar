import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('search')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // GET http://localhost:3007/search?keyword=아반떼
  @Get()
  search(@Query('keyword') keyword: string) {
    
    // 1. 차량 검색 결과 (트림 정보 포함)
    const cars = [
      {
        id: 101,
        name: '아반떼 (CN7)',
        image: 'https://example.com/avante.png',
        priceRange: '1,960 ~ 3,203만원',
        // [핵심] 트림 선택을 위한 정보 제공
        trims: [
          { id: 1, name: 'Smart', price: 19600000 },
          { id: 2, name: 'Modern', price: 22560000 },
          { id: 3, name: 'Inspiration', price: 26710000 }
        ]
      }
    ];

    // 검색 로직 (임시)
    // 키워드가 포함된 차량만 필터링해서 줍니다.
    const filteredCars = keyword 
      ? cars.filter(car => car.name.includes(keyword))
      : cars;

    return {
      success: true,
      keyword: keyword,
      result: {
        cars: filteredCars,
        // (참고) 커뮤니티 글도 같이 보여줄 거면 유지, 아니면 빈 배열
        community: [] as any[] 
      }
    };
  }
}
