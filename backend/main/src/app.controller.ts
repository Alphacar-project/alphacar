import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppService } from './app.service';
import type { Response } from 'express'; // 'import type'으로 변경

@Controller('auth')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin() {
    return;
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLoginCallback(@Req() req, @Res() res: Response) {
    console.log('📍 카카오 콜백 도달함!');
    const user = await this.appService.handleKakaoLogin(req.user);
    
    // 프론트엔드 주소로 리다이렉트
    return res.redirect(`${process.env.CLIENT_URL}/mypage?email=${user.email}&nickname=${encodeURIComponent(user.nickname)}`);
  }
}
