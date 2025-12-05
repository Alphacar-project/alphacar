import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly client: Redis;

  constructor(private configService: ConfigService) {
    // .env 설정값을 불러와 연결
    const password = this.configService.get<string>('REDIS_PASSWORD');
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
      password: password ? password : undefined, 
    });
  }

  // [중요] VehicleService에서 카운트 셀 때 필요해서 추가함
  getClient(): Redis {
    return this.client;
  }

  // [기능 1] 최근 본 차량 저장 (최대 10개 유지)
  async addRecentView(userId: string, vehicleId: string): Promise<void> {
    const key = `recent_views:${userId}`;
    const score = Date.now(); // 현재 시간을 점수로 사용

    // 1. 데이터 저장 (이미 있으면 시간만 업데이트)
    await this.client.zadd(key, score, vehicleId);

    // 2. 데이터 개수 관리 (최신 10개만 남기고 삭제)
    const count = await this.client.zcard(key);
    if (count > 10) {
      await this.client.zremrangebyrank(key, 0, count - 11);
    }

    // 3. 데이터 유효기간 설정 (1일 후 자동 삭제)
    await this.client.expire(key, 60 * 60 * 24);
  }

  // [기능 2] 최근 본 차량 목록 조회 (최신순)
  async getRecentViews(userId: string): Promise<string[]> {
    const key = `recent_views:${userId}`;
    return await this.client.zrevrange(key, 0, -1);
  }
}
