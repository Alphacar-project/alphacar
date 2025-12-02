import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 카카오 로그인 처리 및 DB 저장
  async handleKakaoLogin(kakaoUser: any) {
    console.log('🚀 DB 저장 시도:', kakaoUser);

    // 1. 이미 가입된 유저인지 확인
    let user = await this.userRepository.findOne({ 
      where: { kakaoId: kakaoUser.kakaoId.toString() } 
    });

    // 2. 없으면 새로 생성 (회원가입)
    if (!user) {
      console.log('✨ 신규 유저 생성 중...');
      user = this.userRepository.create({
        kakaoId: kakaoUser.kakaoId.toString(),
        nickname: kakaoUser.nickname,
        email: kakaoUser.email,
        provider: 'kakao',
      });
      await this.userRepository.save(user);
      console.log('💾 DB 저장 완료!');
    } else {
      console.log('👋 기존 유저 로그인:', user.nickname);
    }

    return user;
  }
  
  getHello(): string {
    return 'Hello Alphacar!';
  }
}
