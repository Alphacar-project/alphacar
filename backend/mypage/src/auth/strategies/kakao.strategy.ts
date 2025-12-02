// src/auth/strategies/kakao.strategy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.get('KAKAO_CLIENT_ID'),
      clientSecret: configService.get('KAKAO_CLIENT_SECRET'),
      callbackURL: configService.get('KAKAO_CALLBACK_URL'),
      // 사용자에게 동의 받을 정보
      // scope: ['account_email', 'profile_nickname'], 
      scope: ['profile_nickname'],
    } as any);
  }

  // 인증 성공 후 사용자 정보를 처리하는 로직
  async validate(accessToken: string, refreshToken: string, profile: Profile, done: Function) {
    const user = {
      kakaoId: profile.id, // 카카오 고유 ID
      email: profile._json.kakao_account?.email, // 이메일 (동의 시)
      nickname: profile._json.kakao_account?.profile?.nickname, // 닉네임
      accessToken, 
    };
    
    done(null, user); 
  }
}
