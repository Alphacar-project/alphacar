import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID') || '', // undefined 방지
      clientSecret: '',
      callbackURL: configService.get<string>('KAKAO_CALLBACK_URL') || '', // undefined 방지
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    const payload = {
      kakaoId: profile.id,
      nickname: profile.username,
      email: profile._json.kakao_account?.email || `kakao_${profile.id}@alphacar.com`,
    };
    
    console.log('✅ Kakao Strategy Validate:', payload);
    return done(null, payload);
  }
}
