import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('quote') // 주소 앞에 /quote가 자동으로 붙습니다.
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 1. 견적 초기 데이터 (차량 목록 등)
  // 요청 주소: GET http://localhost:3000/quote
  @Get()
  getQuoteInitData() {
    return {
      message: '견적 페이지 데이터입니다.',
      models: ['Avante', 'Sonata', 'Grandeur', 'Genesis'],
      trims: ['Modern', 'Premium', 'Inspiration']
    };
  }

  // 2. 견적 저장하기 (POST)
  // 요청 주소: POST http://localhost:3000/quote/save
  @Post('save')
  saveQuote(@Body() quoteData: any) {
    console.log('받은 견적 데이터:', quoteData);
    return { success: true, message: '견적이 임시 저장되었습니다.', id: 'temp_1234' };
  }
}
