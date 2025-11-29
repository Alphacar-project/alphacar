import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // 프론트엔드 접속 허용
  
  // 3008번 포트로 설정 (AI Chat Service)
  await app.listen(3008);
  console.log(`AI Chat Service is running on port 3008`);
}
bootstrap();
