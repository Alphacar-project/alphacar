import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // 1. 사용자 검증 (이메일/비번 확인)
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { email } });
    
    // 유저가 있고, 비밀번호가 일치하는지 확인
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user; // 비밀번호 제외하고 리턴
      return result;
    }
    return null;
  }

  // 2. 로그인 토큰 발급
  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  // 3. 회원가입 (테스트용)
  async signup(email: string, pass: string, nickname: string) {
    // 이미 있는 이메일인지 확인
    const existing = await this.usersRepository.findOne({ where: { email } });
    if (existing) {
      throw new UnauthorizedException('이미 존재하는 이메일입니다.');
    }

    // 비밀번호 암호화 후 저장
    const hashedPassword = await bcrypt.hash(pass, 10);
    const newUser = this.usersRepository.create({
      email,
      password: hashedPassword,
      nickname,
    });
    return this.usersRepository.save(newUser);
  }
}
