import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VehicleDocument = HydratedDocument<Vehicle>;

// 실제 DB 컬렉션 이름: vehicles
@Schema({ collection: 'vehicles' })
export class Vehicle {
  @Prop()
  model_name: string; // 모델명 (예: 아반떼)

  @Prop({ type: Types.ObjectId })
  manufacturer_id: Types.ObjectId; // 제조사 ID (연결고리)
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
