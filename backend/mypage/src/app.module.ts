import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // 환경 변수 설정 (.env 파일 로드)
    ConfigModule.forRoot({ 
      isGlobal: true 
    }),

    // MariaDB 데이터베이스 연결 설정
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mariadb',
        host: config.get<string>('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get<string>('DATABASE_USER'),
        password: config.get<string>('DATABASE_PASSWORD'),
        database: config.get<string>('DATABASE_NAME'),
        entities: [User], // User 테이블 등록
        synchronize: true, // 개발 환경용 (서버 시작 시 테이블 자동 수정/생성)
        
        // [중요] SQL 쿼리 로그 활성화
        // true로 설정하면 터미널에 실행되는 모든 SQL(SELECT, INSERT 등)이 보입니다.
        // 로그인이 성공적으로 DB에 저장되는지 확인할 때 필수적입니다.
        logging: true, 
      }),
      inject: [ConfigService],
    }),

    // User 엔티티 사용 등록 (AppService에서 User를 쓸 경우 필요)
    TypeOrmModule.forFeature([User]),

    // 로그인 기능을 담당하는 모듈
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
