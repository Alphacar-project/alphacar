import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 프론트엔드 접속 허용 (로그인 연동을 위해 credentials 옵션 추가 권장)
  app.enableCors({
    origin: true, // 모든 프론트엔드 주소 허용 (개발용)
    credentials: true, // 쿠키/세션 정보 전달 허용
  });

  // 3006번 포트로 설정 (MyPage Service)
  await app.listen(3006);
  console.log(`MyPage Service is running on port 3006`);
}
bootstrap();
