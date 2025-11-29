import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // 프론트엔드 접속 허용
  
  // 계획하신 대로 3002번 포트 사용
  await app.listen(3002);
  console.log(`Main Service is running on port 3002`);
}
bootstrap();
