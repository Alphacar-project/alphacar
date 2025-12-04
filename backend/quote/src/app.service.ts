import { Injectable, NotFoundException } from '@nestjs/common'; // NotFoundException 추가
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Manufacturer } from './schemas/manufacturer.schema';
import { Vehicle } from './schemas/vehicle.schema';
import { VehicleTrim } from './schemas/vehicle_trim.schema';
import { VehicleOption } from './schemas/vehicle_option.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Manufacturer.name) private manufacturerModel: Model<Manufacturer>,
    @InjectModel(Vehicle.name) private vehicleModel: Model<Vehicle>,
    @InjectModel(VehicleTrim.name) private trimModel: Model<VehicleTrim>,
    @InjectModel(VehicleOption.name) private optionModel: Model<VehicleOption>,
  ) {}

  // 1. 제조사 목록
  async getManufacturers() {
    return this.manufacturerModel.find({}, { name: 1, _id: 1 }).exec();
  }

  // 2. 모델 목록
  async getModelsByManufacturer(makerId: string) {
    return this.vehicleModel
      .find({ manufacturer_id: new Types.ObjectId(makerId) }, { model_name: 1, _id: 1 })
      .exec();
  }

  // 3. 트림 목록
  async getTrimsByModel(vehicleId: string) {
    return this.trimModel
      .find({ vehicle_id: new Types.ObjectId(vehicleId) }, { name: 1, base_price: 1, _id: 1 })
      .exec();
  }

  // 4. 트림 상세 정보
  async getTrimDetail(trimId: string) {
    console.log(`[Debug] 요청받은 ID: ${trimId}`);

    try {
      let trimData = await this.trimModel
        .findById(trimId)
        .populate('options')
        .exec();

      if (!trimData) return null;

      // 옵션 데이터가 없을 경우 직접 조회하는 로직 유지
      if (!trimData.options || trimData.options.length === 0) {
        console.log(`[Debug] options 배열이 비어있음 -> vehicleoptions 컬렉션 직접 검색 시도`);

        const foundOptions = await this.optionModel.find({
          trim_id: new Types.ObjectId(trimId)
        }).exec();

        console.log(`[Debug] 직접 찾은 옵션 개수: ${foundOptions.length}`);

        const trimObj = trimData.toObject();
        trimObj.options = foundOptions;
        return trimObj;
      }

      return trimData;
    } catch (e) {
      console.error(`[Debug] DB 에러 발생:`, e);
      return null;
    }
  }

  // 5. [기존] 비교 데이터 조회 메서드 (기존 코드 유지)
  async getCompareData(ids: string) {
    if (!ids) return [];

    // ID 분리
    const idList = ids.split(',').filter(id => id && id.trim() !== '');

    // 각 ID에 대해 getTrimDetail 재사용
    const promises = idList.map(id => this.getTrimDetail(id));

    // 병렬 처리 후 결과 반환
    const results = await Promise.all(promises);
    return results.filter(item => item !== null);
  }

  // 6. ⭐ [신규 추가] 비교 견적 상세 정보 조회 (URL 쿼리 기반)
  // 프론트엔드에서 넘겨준 trimId와 선택된 options ID들을 받아 최종 가격 등을 계산
  async getCompareDetails(trimId: string, optionIds: string[]) {
    // 1. 트림 정보 조회
    const trim = await this.trimModel.findById(trimId).exec();
    if (!trim) {
      throw new NotFoundException('해당 트림 정보를 찾을 수 없습니다.');
    }

    // 2. 차량 모델 정보 조회 (이미지, 모델명 등을 위해 vehicle_id로 조회)
    // 기존 메서드(getTrimsByModel)에서 vehicle_id 필드를 사용하는 것을 확인하여 적용
    const vehicle = await this.vehicleModel.findById(trim['vehicle_id']).exec();

    // 3. 선택된 옵션 정보 조회
    let selectedOptions: any[] = [];
    if (optionIds && optionIds.length > 0) {
      const validIds = optionIds
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id));
      
      if (validIds.length > 0) {
        selectedOptions = await this.optionModel.find({
          _id: { $in: validIds },
        }).exec();
      }
    }

    // 4. 가격 계산
    // 기존 메서드(getTrimsByModel)에서 base_price 필드를 사용하는 것을 확인하여 적용
    const basePrice = trim['base_price'] || 0;
    
    // 옵션 가격 합계 (price 또는 additional_price 필드 대응)
    const totalOptionPrice = selectedOptions.reduce((sum, opt) => {
      const price = opt['price'] || opt['additional_price'] || 0;
      return sum + price;
    }, 0);

    const finalPrice = basePrice + totalOptionPrice;

    // 5. 반환 데이터 구성
    return {
      car: {
        manufacturer: vehicle ? vehicle['manufacturer'] : '', // 스키마에 manufacturer 필드가 없으면 수정 필요
        model: vehicle ? vehicle['model_name'] : '',          // getModelsByManufacturer에서 model_name 확인
        trim_name: trim['name'],
        base_price: basePrice,
        image_url: vehicle ? vehicle['image_url'] : '',       // Vehicle 스키마에 image_url 가정
      },
      selectedOptions: selectedOptions.map(opt => ({
        id: opt._id,
        name: opt['name'] || opt['option_name'],
        price: opt['price'] || opt['additional_price'] || 0
      })),
      totalOptionPrice,
      finalPrice,
    };
  }
}
