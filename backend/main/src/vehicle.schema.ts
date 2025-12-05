// alphacar-project/alphacar/alphacar-0f6f51352a76b0977fcac48535606711be26d728/backend/main/src/vehicle.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Document, Types } from 'mongoose';
import { Manufacturer } from './manufacturer.schema';

export type VehicleDocument = HydratedDocument<Vehicle>;

// 'vehicles' 컬렉션에 연결
@Schema({ 
    collection: 'vehicles' 
    // 👈 [제거] toJSON 옵션은 아래에서 VehicleSchema에 직접 적용합니다.
})
export class Vehicle extends Document {
  // 차량 이름 (DB: model_name)
  @Prop({ required: true })
  model_name: string;

  // 👈 [수정] 제조사 참조 필드명을 실제 DB 필드명인 manufacturer_id로 변경
  @Prop({ type: Types.ObjectId, ref: Manufacturer.name, required: true })
  manufacturer_id: Types.ObjectId;

  // 대표 이미지 URL (DB: image_url)
  @Prop()
  image_url: string;
  
  // 👈 [수정] 가격 필드명을 실제 DB 필드명인 base_price로 변경
  @Prop()
  base_price: number; 
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);

// 👈 [추가] TS 오류를 해결하고 ObjectId를 id로 변환하는 로직을 스키마에 직접 적용
VehicleSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc: any, ret: any) => { // doc, ret 타입을 any로 캐스팅하여 TS2339, TS2790 해결
    ret.id = ret._id.toString();
    delete ret._id;
  },
});
