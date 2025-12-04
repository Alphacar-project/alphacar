import { Controller, Get, Query, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('quote')
export class AppController {
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

  // 3. 트림 목록 조회
  @Get('trims')
  getTrims(@Query('modelId') modelId: string) {
    return this.appService.getTrimsByModel(modelId);
  }

  // 4. 상세 결과 조회
  @Get('detail')
  getDetail(@Query('trimId') trimId: string) {
    return this.appService.getTrimDetail(trimId);
  }

  // 5. [기존] 비교 데이터 조회 API (단순 트림 ID 목록 조회용)
  @Get('compare-data')
  getCompareData(@Query('ids') ids: string) {
    return this.appService.getCompareData(ids);
  }

  // 6. ⭐ [신규 추가] 비교 견적 상세 정보 조회 API
  // 프론트엔드 비교견적 페이지에서 trimId와 options를 받아 상세 정보를 반환합니다.
  // 요청 예시: GET /quote/compare-details?trimId=...&options=opt1,opt2
  @Get('compare-details')
  async getCompareDetails(
    @Query('trimId') trimId: string,
    @Query('options') optionsString: string,
  ) {
    // 유효성 검사
    if (!trimId) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'trimId(트림 ID)는 필수입니다.',
      };
    }

    // 콤마로 구분된 옵션 ID 문자열을 배열로 변환
    const optionIds = optionsString
      ? optionsString.split(',').filter((id) => id.trim() !== '')
      : [];

    // Service의 getCompareDetails 메서드 호출 (이전 단계에서 Service에 추가함)
    return await this.appService.getCompareDetails(trimId, optionIds);
  }
}
