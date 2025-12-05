import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.manufacturerModel.find({}, { name: 1, _id: 1 }).lean().exec();
  }

  // 2. 모델 목록
  async getModelsByManufacturer(makerId: string) {
    return this.vehicleModel
      .find({ manufacturer_id: new Types.ObjectId(makerId) }, { model_name: 1, _id: 1 })
      .lean()
      .exec();
  }

  // 3. 트림 목록
  async getTrimsByModel(vehicleId: string) {
    // [추가된 방어 코드]
    // 값이 비어있거나, MongoDB의 ID 형식이 아닌 이상한 값이면 DB 조회를 하지 않고 빈 배열 반환
    if (!vehicleId || !Types.ObjectId.isValid(vehicleId)) {
      return [];
    }

    return this.trimModel
      .find({ vehicle_id: new Types.ObjectId(vehicleId) }, { name: 1, base_price: 1, _id: 1 })
      .lean()
      .exec();
  }

  // 4. ⭐ [수정됨] 트림 상세 정보 (개별 견적용) - 제조사/모델명 추가 조회
  async getTrimDetail(trimId: string) {
    try {
      let trimData: any = await this.trimModel
        .findById(trimId)
        .populate('options')
        .lean()
        .exec();

      if (!trimData) return null;

      // 옵션이 비어있으면 수동 조회
      if (!trimData.options || trimData.options.length === 0) {
        const foundOptions = await this.optionModel.find({
          trim_id: new Types.ObjectId(trimId)
        }).lean().exec();
        trimData.options = foundOptions;
      }

      // 차량 정보 및 제조사 정보 조회
      const vehicleId = trimData.vehicle_id || trimData.vehicle;
      if (vehicleId) {
        const vehicle: any = await this.vehicleModel.findById(vehicleId).lean().exec();
        if (vehicle) {
          trimData.image_url = vehicle.image_url || vehicle.image || '';
          trimData.model_name = vehicle.model_name || vehicle.name || '';
          
          // 제조사 이름 조회
          const makerId = vehicle.manufacturer_id || vehicle.manufacturer;
          if (makerId) {
             if (Types.ObjectId.isValid(makerId)) {
                const maker = await this.manufacturerModel.findById(makerId).lean().exec();
                if (maker) trimData.manufacturer = maker.name; // 제조사 이름 할당
             } else {
                trimData.manufacturer = makerId; 
             }
          }
        }
      }

      return trimData;
    } catch (e) {
      console.error(`[Debug] DB 에러 발생:`, e);
      return null;
    }
  }

  // 5. 비교 데이터 조회 (목록용)
  async getCompareData(ids: string) {
    if (!ids) return [];

    const idList = ids.split(',').filter(id => id && id.trim() !== '');

    const promises = idList.map(async (id) => {
      const trim: any = await this.trimModel.findById(id).populate('options').lean().exec();
      if (!trim) return null;

      if (!trim.options || trim.options.length === 0) {
        const foundOptions = await this.optionModel.find({
          trim_id: new Types.ObjectId(id)
        }).lean().exec();
        trim.options = foundOptions;
      }

      let modelName = 'Unknown Model';
      let makerName = 'Unknown Maker';
      let imageUrl = '';

      const vehicleId = trim.vehicle_id || trim.vehicle;

      if (vehicleId) {
        const vehicle: any = await this.vehicleModel.findById(vehicleId).lean().exec();
        if (vehicle) {
          modelName = vehicle.model_name || vehicle.name || modelName;
          imageUrl = vehicle.image_url || vehicle.image || '';

          const makerId = vehicle.manufacturer_id || vehicle.manufacturer;
          if (makerId) {
             if (Types.ObjectId.isValid(makerId)) {
                const maker = await this.manufacturerModel.findById(makerId).lean().exec();
                if (maker) makerName = maker.name;
             } else {
                makerName = String(makerId);
             }
          }
        }
      }

      return {
        ...trim,
        model_name: modelName,
        manufacturer: makerName,
        image_url: imageUrl,
      };
    });

    const results = await Promise.all(promises);
    return results.filter(item => item !== null);
  }

  // 6. 비교 견적 상세 정보 조회 (저장용)
  async getCompareDetails(trimId: string, optionIds: string[]) {
    const trim: any = await this.trimModel.findById(trimId).lean().exec();
    if (!trim) {
      throw new NotFoundException('Trim Not Found');
    }

    let modelName = '';
    let makerName = '';
    let imageUrl = '';

    const vehicleId = trim.vehicle_id || trim.vehicle;

    if (vehicleId) {
        const vehicle: any = await this.vehicleModel.findById(vehicleId).lean().exec();
        if (vehicle) {
            modelName = vehicle.model_name || vehicle.name || '';
            imageUrl = vehicle.image_url || vehicle.image || '';

            const makerId = vehicle.manufacturer_id || vehicle.manufacturer;
            if (makerId) {
                if (Types.ObjectId.isValid(makerId)) {
                    const maker = await this.manufacturerModel.findById(makerId).lean().exec();
                    if (maker) makerName = maker.name;
                } else {
                    makerName = String(makerId);
                }
            }
        }
    }

    let selectedOptions: any[] = [];
    if (optionIds && optionIds.length > 0) {
      const validIds = optionIds
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id));

      if (validIds.length > 0) {
        selectedOptions = await this.optionModel.find({
          _id: { $in: validIds },
        }).lean().exec();
      }
    }

    const basePrice = trim.base_price || 0;
    const totalOptionPrice = selectedOptions.reduce((sum, opt) => {
      const price = opt.price || opt.additional_price || 0;
      return sum + price;
    }, 0);

    return {
      car: {
        manufacturer: makerName,
        model: modelName,
        trim_name: trim.name,
        base_price: basePrice,
        image_url: imageUrl,
      },
      selectedOptions: selectedOptions.map(opt => ({
        id: opt._id,
        name: opt.name || opt.option_name,
        price: opt.price || opt.additional_price || 0
      })),
      totalOptionPrice,
      finalPrice: basePrice + totalOptionPrice,
    };
  }
}
