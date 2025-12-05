// src/chat/chat.controller.ts
import { 
  Body, 
  Controller, 
  Post, 
  UploadedFile, 
  UseInterceptors, 
  ParseFilePipeBuilder, 
  HttpStatus 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import { Express } from 'express'; // 타입 정의용 (없으면 무시 가능)

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // 1. [기존] 텍스트 질문하기
  @Post('ask')
  async ask(@Body('message') message: string) {
    return this.chatService.chat(message);
  }

  // 2. [추가] 이미지 업로드 및 분석 요청
  // 프론트엔드가 /api/chat/image 로 보내면 -> HAProxy가 /chat/image 로 변환해서 여기로 전달함
  @Post('image')
  @UseInterceptors(FileInterceptor('file')) // 프론트의 formData.append('file', ...) 과 이름 일치해야 함
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp|gif)$/, // 허용할 이미지 형식
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB 용량 제한
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    // ChatService의 이미지 처리 메서드 호출
    return this.chatService.chatWithImage(file.buffer, file.mimetype);
  }

  // 3. [기존] 지식 추가 (테스트용)
  @Post('knowledge')
  async addKnowledge(@Body() body: { content: string; source: string }) {
    return this.chatService.addKnowledge(body.content, body.source);
  }
}
