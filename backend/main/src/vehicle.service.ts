import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RedisService } from './redis/redis.service';

// [수정 포인트] 로컬 파일 대신 공통 스키마 경로(../../schemas/) 사용
import { Vehicle, VehicleDocument } from '../../schemas/vehicle.schema';

@Injectable()
export class VehicleService {
  private readonly logger = new Logger(VehicleService.name);

  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
    private readonly redisService: RedisService
  ) {}

  // 1. 전체 차량 조회
  async findAll(): Promise<Vehicle[]> {
    const results = await this.vehicleModel.find().exec();
    return results;
  }

  // 2. 특정 차량 상세 조회
  async findOne(id: string): Promise<Vehicle> {
    // 1. ID 형식 유효성 검사
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`요청된 차량 ID '${id}'의 형식이 유효하지 않습니다.`);
    }

    try {
      // 2. DB 조회
      const vehicle = await this.vehicleModel.findById(id).exec();

      if (!vehicle) {
        throw new NotFoundException(`ID가 ${id}인 차량을 찾을 수 없습니다.`);
      }

      return vehicle;

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error(`[DB ERROR] ID ${id} 조회 중 오류:`, error.message);
      throw new InternalServerErrorException('데이터베이스 조회 중 서버 내부 오류가 발생했습니다.');
    }
  }

  // ==========================================================
  // Redis 관련 로직
  // ==========================================================

  // 1. 최근 본 차량 저장
  async addRecentView(userId: string, vehicleId: string) {
    await this.redisService.addRecentView(userId, vehicleId);
    const count = await this.getRecentCount(userId);
    return { success: true, count };
  }

  // 2. 읽은 차량 개수 조회
  async getRecentCount(userId: string): Promise<number> {
    const client = this.redisService.getClient();
    const key = `recent_views:${userId}`;
    return await client.zcard(key);
  }

  // 3. [핵심 수정] 최근 본 차량 목록 조회 (타입 에러 수정됨)
  async getRecentVehicles(userId: string): Promise<any[]> {
    if (!userId) return [];

    const vehicleIds = await this.redisService.getRecentViews(userId);

    if (!vehicleIds || vehicleIds.length === 0) {
      return [];
    }

    this.logger.log(`[Recent] 유저(${userId})의 최근 기록 ${vehicleIds.length}건 조회`);

    const promises = vehicleIds.map(async (id) => {
        try {
            let vehicle: any = null;

            // 🚨 [수정 완료] { _id: id } as any 를 추가하여 타입 에러 방지
            vehicle = await this.vehicleModel.collection.findOne({ _id: id } as any);
            
            // ObjectId 변환 검색 시도
            if (!vehicle && Types.ObjectId.isValid(id)) {
                vehicle = await this.vehicleModel.collection.findOne({ _id: new Types.ObjectId(id) } as any);
            }

            if (!vehicle) return null;

            const minPrice = vehicle.trims && vehicle.trims.length > 0 
                ? Math.min(...vehicle.trims.map((t: any) => t.price || 0)) 
                : 0;

            return {
                _id: vehicle._id.toString(),
                name: vehicle.vehicle_name,
                brand: vehicle.brand_name,
                image: vehicle.main_image,
                price: minPrice,
            };
        } catch (e) {
            this.logger.error(`[Recent] ID(${id}) 조회 실패: ${e.message}`);
            return null;
        }
    });

    const results = await Promise.all(promises);
    return results.filter(item => item !== null);
  }
}
