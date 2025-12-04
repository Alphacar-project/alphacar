// backend/aichat/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ [핵심] CORS 설정: 프론트엔드(localhost:3000)의 요청을 허용
  app.enableCors({
    origin: 'http://localhost:8080', // 프론트엔드 주소
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // 쿠키/헤더 전달 허용
  });

  // 포트 설정 (3008)
  const port = process.env.PORT || 3008;
  await app.listen(port);
  console.log(`🚀 AI Chat Service is running on port ${port}`);
}
bootstrap();
