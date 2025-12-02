import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('quote')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 1. 제조사 목록 조회
  // GET /quote/makers
  @Get('makers')
  getMakers() {
    return this.appService.getManufacturers();
  }

  // 2. 모델 목록 조회 (제조사 ID 필요)
  // GET /quote/models?makerId=xxxx
  @Get('models')
  getModels(@Query('makerId') makerId: string) {
    return this.appService.getModelsByManufacturer(makerId);
  }

  // 3. 트림 목록 조회 (모델 ID 필요)
  // GET /quote/trims?modelId=xxxx
  @Get('trims')
  getTrims(@Query('modelId') modelId: string) {
    return this.appService.getTrimsByModel(modelId);
  }

  // 4. 상세 결과 조회 (트림 ID 필요)
  // GET /quote/detail?trimId=xxxx
  @Get('detail')
  getDetail(@Query('trimId') trimId: string) {
    return this.appService.getTrimDetail(trimId);
  }
}
