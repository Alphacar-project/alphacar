import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // 프론트엔드 접속 허용
  
  // 3002번 포트에서 실행 (다른 서비스와 충돌 방지)
  await app.listen(3004);
  console.log(`Drive Service is running on port 3004`);
}
bootstrap();
