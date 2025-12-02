import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service'; // [추가]
import { KakaoStrategy } from './strategies/kakao.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { JwtModule } from '@nestjs/jwt'; // [추가]

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]), // DB 사용
    // [추가] JWT 토큰 설정 (비밀키는 임의로 설정)
    JwtModule.register({
      secret: 'secretKey1234', // 실제 서비스에선 .env로 빼야 함
      signOptions: { expiresIn: '1h' }, // 토큰 유효시간 1시간
    }),
  ],
  controllers: [AuthController],
  providers: [KakaoStrategy, AuthService], // AuthService 등록
  exports: [AuthService],
})
export class AuthModule {}
