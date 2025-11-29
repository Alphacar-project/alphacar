import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // 프론트엔드 접속 허용
  
  // 3006번 포트로 설정 (MyPage Service)
  await app.listen(3006);
  console.log(`MyPage Service is running on port 3006`);
}
bootstrap();
