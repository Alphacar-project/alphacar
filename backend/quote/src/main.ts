import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 1. 프론트엔드(Next.js)와의 통신을 위해 CORS 허용 (필수)
  app.enableCors();
  
  // 2. 계획한 대로 3003번 포트 사용
  await app.listen(3003);
  console.log(`Quote Service is running on port 3003`);
}
bootstrap();
