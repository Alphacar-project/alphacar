// src/chat/chat.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // 질문하기 엔드포인트
  @Post('ask')
  async ask(@Body('message') message: string) {
    return this.chatService.chat(message);
  }

  // 지식 추가 엔드포인트 (테스트용)
  @Post('knowledge')
  async addKnowledge(@Body() body: { content: string; source: string }) {
    return this.chatService.addKnowledge(body.content, body.source);
  }
}
