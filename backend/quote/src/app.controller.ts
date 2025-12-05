import { Controller, Get, Query, HttpStatus, Logger } from '@nestjs/common';
import { AppService } from './app.service';

// [중요] @Controller('quote') 이므로 실제 주소는 /quote/trims 가 됩니다.
@Controller('quote')
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  // 1. 제조사 목록 조회
  @Get('makers')
  getMakers() {
    return this.appService.getManufacturers();
  }

  // 2. 모델 목록 조회
  @Get('models')
  getModels(@Query('makerId') makerId: string) {
    return this.appService.getModelsByManufacturer(makerId);
  }

  // 3. 트림 목록 조회 (🚨 여기가 에러 발생 지점)
  @Get('trims')
  getTrims(@Query('modelId') modelId: string) {
    // [수정] modelId가 비어있으면 DB에 가지 않고 빈 배열([])을 줘서 500 에러를 막습니다.
    if (!modelId || modelId === 'undefined') {
      return []; 
    }
    return this.appService.getTrimsByModel(modelId);
  }

  // 4. 상세 결과 조회
  @Get('detail')
  getDetail(@Query('trimId') trimId: string) {
    return this.appService.getTrimDetail(trimId);
  }

  // 5. 비교 데이터 조회 API
  @Get('compare-data')
  getCompareData(@Query('ids') ids: string) {
    return this.appService.getCompareData(ids);
  }

  // 6. 비교 견적 상세 정보 조회 API
  @Get('compare-details')
  async getCompareDetails(
    @Query('trimId') trimId: string,
    @Query('options') optionsString: string,
  ) {
    if (!trimId) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'trimId(트림 ID)는 필수입니다.',
      };
    }

    const optionIds = optionsString
      ? optionsString.split(',').filter((id) => id.trim() !== '')
      : [];

    return await this.appService.getCompareDetails(trimId, optionIds);
  }
}
