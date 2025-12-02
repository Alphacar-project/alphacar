// backend/quote/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Manufacturer, ManufacturerSchema } from './schemas/manufacturer.schema';
import { Vehicle, VehicleSchema } from './schemas/vehicle.schema';
import { VehicleTrim, VehicleTrimSchema } from './schemas/vehicle_trim.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // 1. DB 연결 설정
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        uri: `mongodb://${config.get('DATABASE_USER')}:${config.get('DATABASE_PASSWORD')}@${config.get('DATABASE_HOST')}:${config.get('DATABASE_PORT')}/${config.get('DATABASE_NAME')}?authSource=admin`,
      }),
      inject: [ConfigService],
    }),
    // 2. 컬렉션 3개 등록 (manufacturers, vehicles, vehicletrim)
    MongooseModule.forFeature([
      { name: Manufacturer.name, schema: ManufacturerSchema },
      { name: Vehicle.name, schema: VehicleSchema },
      { name: VehicleTrim.name, schema: VehicleTrimSchema },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
