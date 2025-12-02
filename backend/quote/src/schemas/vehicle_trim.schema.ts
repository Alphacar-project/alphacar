// backend/quote/src/schemas/vehicle_trim.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VehicleTrimDocument = HydratedDocument<VehicleTrim>;

@Schema({ collection: 'vehicletrims' }) // 컬렉션 이름 유지
export class VehicleTrim {
  @Prop()
  name: string; 

  @Prop({ type: Types.ObjectId })
  vehicle_id: Types.ObjectId; 

  // [수정] price -> base_price
  @Prop()
  base_price: number;

  // [추가] description (설명)
  @Prop()
  description: string;

  // [추가] image_url (차량 이미지)
  @Prop()
  image_url: string;
}

export const VehicleTrimSchema = SchemaFactory.createForClass(VehicleTrim);
