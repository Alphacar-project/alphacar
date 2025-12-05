import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle } from './vehicle.schema';
import { RedisService } from './redis/redis.service';

@Injectable()
export class VehicleService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<Vehicle>,
    private readonly redisService: RedisService
  ) {}

  // [기존 기능 유지] 전체 차량 조회
  async findAll(): Promise<Vehicle[]> {
    const results = await this.vehicleModel.find().exec();
    return results;
  }

  // [기존 기능 유지] 특정 차량 상세 조회
  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleModel.findById(id).exec();
    if (!vehicle) {
      throw new NotFoundException(`ID가 ${id}인 차량을 찾을 수 없습니다.`);
    }
    return vehicle;
  }

  // ==========================================================
  // [수정 및 추가된 기능] Redis 관련 로직
  // ==========================================================

  // 1. [수정] 최근 본 차량 저장 후 '현재 개수' 반환 (프론트엔드 빨간 원 업데이트용)
  async addRecentView(userId: string, vehicleId: string) {
    // (1) RedisService를 통해 저장
    await this.redisService.addRecentView(userId, vehicleId);
    
    // (2) 저장 후, 현재 몇 개인지 바로 세어서 가져옴
    const count = await this.getRecentCount(userId);

    // (3) 성공 여부와 개수를 함께 반환
    return { success: true, count };
  }

  // 2. [추가] 읽은 차량 개수만 빠르게 조회 (페이지 접속 시 빨간 원 표시용)
  async getRecentCount(userId: string): Promise<number> {
    // Redis 클라이언트를 가져와서 직접 명령어를 사용
    // 주의: RedisService에 getClient() 메서드가 있어야 합니다.
    const client = this.redisService.getClient();
    const key = `recent_views:${userId}`;
    
    // zcard: 저장된 리스트의 개수를 세는 Redis 명령어
    return await client.zcard(key);
  }

  // 3. [기존 기능 유지] 최근 본 차량 목록 가져오기
  async getRecentVehicles(userId: string): Promise<Vehicle[]> {
    const vehicleIds = await this.redisService.getRecentViews(userId);

    if (!vehicleIds || vehicleIds.length === 0) {
      return [];
    }

    const vehicles = await this.vehicleModel.find({
      _id: { $in: vehicleIds }
    }).exec();

    // Redis 순서(최신순)대로 정렬
    const sortedVehicles = vehicleIds
      .map(id => vehicles.find(v => v._id.toString() === id))
      .filter(v => v !== undefined) as Vehicle[];

    return sortedVehicles;
  }
}
