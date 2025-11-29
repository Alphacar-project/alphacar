import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // 프론트엔드 접속 허용
  
  // 3007번 포트로 설정 (Search Service)
  await app.listen(3007);
  console.log(`Search Service is running on port 3007`);
}
bootstrap();
