import { Controller, Get, Post, Body, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 1. 이메일 로그인 API
  @Post('login')
  async login(@Body() body) {
    // 프론트에서 보낸 email, password를 받음
    const validUser = await this.authService.validateUser(body.email, body.password);
    
    if (!validUser) {
      return { success: false, message: '이메일 또는 비밀번호가 틀렸습니다.' };
    }

    // 로그인 성공 시 토큰 발급
    return this.authService.login(validUser);
  }

  // 2. 회원가입 API (테스트용)
  @Post('signup')
  async signup(@Body() body) {
    try {
      const newUser = await this.authService.signup(body.email, body.password, '신규유저');
      return { success: true, user: newUser };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  // --- 기존 카카오 로그인 코드 유지 ---
  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin() {
    return;
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLoginCallback(@Req() req, @Res() res: Response) {
    const user = req.user;
    // IP 주소는 환경에 맞게 유지 (192.168.0.160 등)
    res.redirect(`https://192.168.0.160:8000/mypage?email=${user.email}&nickname=${user.nickname}`);
  }
}
