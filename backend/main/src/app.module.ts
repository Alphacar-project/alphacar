// backend/main/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Vehicle, VehicleSchema } from './vehicle.schema';
import { Manufacturer, ManufacturerSchema } from './manufacturer.schema';
import { RedisModule } from './redis/redis.module';

// [추가] Vehicle 관련 컨트롤러와 서비스 import
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    // [기존 유지] 환경변수로 DB 연결하는 안전한 방식 유지
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        uri: `mongodb://${config.get('DATABASE_USER')}:${config.get('DATABASE_PASSWORD')}@${config.get('DATABASE_HOST')}:${config.get('DATABASE_PORT')}/${config.get('DATABASE_NAME')}?authSource=admin`,
      }),
      inject: [ConfigService],
    }),

    // [기존 유지] 스키마 등록
    MongooseModule.forFeature([
      { name: Vehicle.name, schema: VehicleSchema },
      { name: Manufacturer.name, schema: ManufacturerSchema },
    ]),

    RedisModule,
  ],
  controllers: [
    AppController,
    VehicleController, // ★ [핵심] 여기에 컨트롤러를 등록해야 주소가 생깁니다!
  ],
  providers: [
    AppService,
    VehicleService, // ★ [핵심] 서비스도 여기에 등록해야 사용 가능합니다.
  ],
})
export class AppModule {}
