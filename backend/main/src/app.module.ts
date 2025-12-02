import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user.entity';

@Module({
  imports: [
    // 1. MariaDB 연결 설정
    TypeOrmModule.forRoot({
      type: 'mariadb',        // 데이터베이스 종류
      host: 'team1',      // DB 주소 (로컬이 아니면 IP 입력)
      port: 15432,             // MariaDB 기본 포트
      username: 'team1',       // DB 아이디
      password: 'Gkrtod1@',   // ⭐ DB 비밀번호 (여기를 꼭 수정해주세요!)
      database: 'users',   // 사용할 데이터베이스 이름 (미리 생성되어 있어야 함)
      entities: [User],       // 위에서 만든 유저 테이블 등록
      synchronize: true,      // 개발용 옵션: 코드를 수정하면 DB 테이블도 자동으로 수정됨
    }),
    
    // 2. User 테이블을 이 모듈에서 사용하겠다고 등록
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
