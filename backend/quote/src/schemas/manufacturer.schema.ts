import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ManufacturerDocument = HydratedDocument<Manufacturer>;

// 실제 DB 컬렉션 이름: manufacturers
@Schema({ collection: 'manufacturers' })
export class Manufacturer {
  @Prop()
  name: string; // 제조사명 (예: 현대)
}

export const ManufacturerSchema = SchemaFactory.createForClass(Manufacturer);
