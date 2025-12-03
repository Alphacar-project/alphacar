// src/auth/auth.service.ts
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async kakaoLogin(code: string) {
    // 1. 카카오 토큰 받기
    const kakaoTokenUrl = 'https://kauth.kakao.com/oauth/token';
    const tokenParams = new URLSearchParams();
    tokenParams.append('grant_type', 'authorization_code');
    tokenParams.append('client_id', '342d0463be260fc289926a0c63c4badc'); 
    // 👇 FE 리다이렉트 URI와 완벽히 일치해야 토큰을 받을 수 있음 (HTTPS 8000)
    tokenParams.append('redirect_uri', 'https://192.168.0.160:8000/mypage');
    tokenParams.append('code', code);

    let accessToken = '';
    try {
      const response = await firstValueFrom(
        this.httpService.post(kakaoTokenUrl, tokenParams.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      accessToken = response.data.access_token;
    } catch (e) {
      this.logger.error('카카오 토큰 발급 실패', e.response?.data);
      throw new BadRequestException('카카오 토큰 발급 실패');
    }

    // 2. 유저 정보 받기
    const userInfoUrl = 'https://kapi.kakao.com/v2/user/me';
    let kakaoUser;
    try {
      const response = await firstValueFrom(
        this.httpService.get(userInfoUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      kakaoUser = response.data;
    } catch (e) {
      throw new BadRequestException('카카오 유저 정보 조회 실패');
    }

    // 3. MariaDB 저장 (DB 저장 로직)
    const kakaoId = kakaoUser.id.toString();
    const nickname = kakaoUser.properties?.nickname;
    const email = kakaoUser.kakao_account?.email;

    let user = await this.userRepository.findOne({ where: { kakaoId } });

    if (!user) {
      user = this.userRepository.create({ kakaoId, nickname, email, provider: 'kakao', point: 0, quoteCount: 0 });
      await this.userRepository.save(user); // 👈 DB에 저장되는 순간
    }

    // 4. 응답 생성
    const jwt = this.jwtService.sign({ userId: user.id, role: user.role });
    return {
      access_token: jwt,
      user: { nickname: user.nickname, email: user.email, provider: user.provider, point: user.point, quoteCount: user.quoteCount },
    };
  }
}
