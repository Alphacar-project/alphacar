import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // 프론트엔드 접속 허용
  
  // 3005번 포트로 설정 (Community Service)
  await app.listen(3005);
  console.log(`Community Service is running on port 3005`);
}
bootstrap();
