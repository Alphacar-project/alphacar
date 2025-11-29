import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('mypage')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 1. 마이페이지 진입 (GET)
  // 프론트엔드가 이 API를 호출하면 "로그인이 필요하다"는 정보를 줍니다.
  @Get()
  getMypageInfo() {
    return {
      isLoggedIn: false, // 이 값이 false면 프론트엔드는 로그인 화면을 유지합니다.
      message: '로그인이 필요한 페이지입니다.',
      user: null
    };
  }

  // 2. 비회원 견적 조회 (POST)
  // 스크린샷에 있는 [견적번호를 입력하세요] 기능을 테스트합니다.
  @Post('check')
  checkQuoteNonMember(@Body() body: any) {
    const quoteId = body.quoteId; // 프론트에서 보낸 견적 번호
    console.log(`비회원 견적 조회 요청: ${quoteId}`);

    if (quoteId === '12345') {
      return { success: true, status: '계약 진행 중', model: '아반떼 Hybrid' };
    } else {
      return { success: false, message: '유효하지 않은 견적 번호입니다.' };
    }
  }
}
