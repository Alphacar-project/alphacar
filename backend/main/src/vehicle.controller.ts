import { Controller, Get, Post, Param, Body, Query, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { VehicleService } from './vehicle.service';

// ✅ [복구] 다시 'vehicles'로 설정 (기존 규칙 준수)
@Controller('vehicles')
export class VehicleController {
  private readonly logger = new Logger(VehicleController.name);

  constructor(private readonly vehicleService: VehicleService) {}

  // 1. [GET] 배지 카운트
  @Get('history/count')
  async getCount(@Query('userId') userId: string) {
    const finalUserId = userId || 'guest_user';
    return { count: await this.vehicleService.getRecentCount(finalUserId) };
  }

  // 2. [POST] 조회수 기록
  @Post(':id/view')
  async recordView(@Param('id') vehicleId: string, @Body('userId') userId: string) {
    const finalUserId = userId || 'guest_user';
    return await this.vehicleService.addRecentView(finalUserId, vehicleId);
  }

  // 3. [GET] 상세 조회 (견적용)
  @Get('detail')
  async getVehicleDetailData(@Query('trimId') trimId: string) {
    if (!trimId) throw new HttpException('Trim ID 필요', HttpStatus.BAD_REQUEST);
    return await this.vehicleService.findOne(trimId);
  }

  // 4. [GET] 전체 조회
  @Get()
  async findAll() { return this.vehicleService.findAll(); }

  // 5. [GET] 단일 조회
  @Get(':id')
  async findOne(@Param('id') id: string) { return this.vehicleService.findOne(id); }
}
