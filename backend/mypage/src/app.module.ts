// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module'; // 👈 AuthModule 임포트
import { AuthController } from './auth/auth.controller'; // 👈 AuthController 임포트
import { User } from './entities/user.entity';

@Module({
  imports: [
    // MariaDB 연결 설정
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: '211.46.52.151',
      port: 15432, // DB 포트
      username: 'team1',
      password: 'Gkrtod1@', // 계정 비밀번호
      database: 'team1',
      entities: [User],
      synchronize: true,
      logging: true,
    }),
    AuthModule, // 👈 AuthModule 등록
  ],
  controllers: [AuthController], // 👈 AppController 대신 AuthController만 등록
  providers: [],
})
export class AppModule {}
