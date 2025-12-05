// alphacar-project/alphacar/alphacar-0f6f51352a76b0977fcac48535606711be26d728/backend/main/src/app.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vehicle, VehicleDocument } from './vehicle.schema';
import { Manufacturer, ManufacturerDocument } from './manufacturer.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
    @InjectModel(Manufacturer.name) private manufacturerModel: Model<ManufacturerDocument>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async findAllMakers() {
    return this.manufacturerModel.find().exec();
  }

  async getCarList() {
    // Aggregation Pipeline을 사용하여 Vehicle과 Manufacturer를 조인합니다.
    const vehiclesWithManufacturer = await this.vehicleModel.aggregate([
      // 1. manufacturers 컬렉션과 조인 ($lookup)
      {
        $lookup: {
          from: 'manufacturers',            // 조인할 컬렉션 이름
          localField: 'manufacturer_id',    // 👈 [수정] DB 필드명 manufacturer_id 사용
          foreignField: '_id',              // manufacturers 컬렉션의 _id 참조
          as: 'manufacturer_info',          // 결과를 저장할 새로운 필드 이름
        },
      },
      // 2. manufacturer_info 배열을 객체로 변환 ($unwind)
      {
        $unwind: '$manufacturer_info',
      },
      // 3. 필요한 필드만 선택 및 이름 변경 ($project)
      {
        $project: {
          _id: 1,
          name: '$model_name',                       // model_name -> name
          manufacturer: '$manufacturer_info.name',   // manufacturer_info.name -> manufacturer
          imageUrl: '$image_url',                    // image_url -> imageUrl
          minPrice: '$base_price',                   // 👈 [수정] base_price -> minPrice
        },
      },
    ]).exec();
    
    return vehiclesWithManufacturer;
  }
  
  async getModelsByMaker(makerId: string) {
    console.log(`🔍 [요청 도착] 제조사 ID: ${makerId}`);

    // 1. 그냥 문자열로 조회해보기
    let results = await this.vehicleModel.find({ manufacturer_id: makerId }).exec();
    console.log(`👉 문자열 조회 결과: ${results.length}개`);

    // 2. 만약 결과가 0개라면, ObjectId로 변환해서 다시 조회 (DB 저장 방식에 따라 다름)
    if (results.length === 0) {
      try {
        console.log("⚠️ 결과가 없어서 ObjectId로 변환 시도...");
        const objectId = new Types.ObjectId(makerId);
        results = await this.vehicleModel.find({ manufacturer_id: objectId }).exec();
        console.log(`👉 ObjectId 조회 결과: ${results.length}개`);
      } catch (e) {
        console.log("❌ ObjectId 변환 실패 (ID 형식이 아님)");
      }
    }

    return results;

  }
  // [수정] 트림 목록 조회 (정석 버전)
  async getTrims(vehicleId: string) {
    // 1. 차량 정보 조회
    // 이제 vehicleId에 "trims" 같은 이상한 문자가 안 들어오므로 바로 조회해도 안전합니다.
    const vehicle = await this.vehicleModel.findById(vehicleId).exec();
    if (!vehicle) return [];

    // 2. 같은 모델명을 가진 트림들 찾기
    return this.vehicleModel.find({
      manufacturer_id: vehicle.manufacturer_id,
      model_name: vehicle.model_name
    }).exec();
  }

}
