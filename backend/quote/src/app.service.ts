import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Manufacturer } from './schemas/manufacturer.schema';
import { Vehicle } from './schemas/vehicle.schema';
import { VehicleTrim } from './schemas/vehicle_trim.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Manufacturer.name) private manufacturerModel: Model<Manufacturer>,
    @InjectModel(Vehicle.name) private vehicleModel: Model<Vehicle>,
    @InjectModel(VehicleTrim.name) private trimModel: Model<VehicleTrim>,
  ) {}

  // 1. 모든 제조사 목록 가져오기
  async getManufacturers() {
    return this.manufacturerModel.find({}, { name: 1, _id: 1 }).exec();
  }

  // 2. 특정 제조사의 모델 목록 가져오기
  async getModelsByManufacturer(makerId: string) {
    return this.vehicleModel
      .find({ manufacturer_id: new Types.ObjectId(makerId) }, { model_name: 1, _id: 1 })
      .exec();
  }

  // 3. 특정 모델의 트림 목록 가져오기
  async getTrimsByModel(vehicleId: string) {
    // [수정] price -> base_price (DB 필드명에 맞춤)
    return this.trimModel
      .find({ vehicle_id: new Types.ObjectId(vehicleId) }, { name: 1, base_price: 1, _id: 1 })
      .exec();
  }
  // 4. 특정 트림의 상세 정보(제원) 가져오기 (로그 기능 추가됨)
  async getTrimDetail(trimId: string) {
    console.log(`[Debug] 요청받은 ID: ${trimId}`); // 요청 로그

    try {
      const result = await this.trimModel.findById(trimId).exec();
      console.log(`[Debug] DB 검색 결과:`, result); // 결과 로그
      return result;
    } catch (e) {
      console.error(`[Debug] DB 에러 발생:`, e); // 에러 로그
      return null;
    }
  }
}
