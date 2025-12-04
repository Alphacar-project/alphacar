import { NestFactory } from '@nestjs/core';
import { ChatModule } from '../src/chat/chat.module';
import { ChatService } from '../src/chat/chat.service';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import { ConverseCommand, ConverseCommandInput } from '@aws-sdk/client-bedrock-runtime';

dotenv.config();

async function bootstrap() {
  console.log('🚀 [AI Full-Scan] 차량 데이터 정밀 주입 (차종/차급/연료 AI 전면 재분석)...');

  const app = await NestFactory.createApplicationContext(ChatModule);
  const chatService = app.get(ChatService);

  // Bedrock 클라이언트를 서비스에서 가져오거나 새로 생성 (여기서는 서비스의 private client 접근이 어려우므로 새로 생성 없이 서비스 메소드 확장 또는 직접 호출)
  // 편의상 ChatService에 있는 classifyCar 로직을 확장해서 쓰겠습니다.
  // ChatService 코드를 수정하지 않고 여기서 로직을 구현합니다.

  const mongoUrl = `mongodb://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}`;
  const client = new MongoClient(mongoUrl);

  try {
    await client.connect();
    console.log('✅ MongoDB 연결 성공!');

    const db = client.db('triple_db');
    const vehiclesCol = db.collection('vehicles');
    const manufacturersCol = db.collection('manufacturers');
    const trimsCol = db.collection('vehicletrims');
    const optionsCol = db.collection('vehicleoptions');

    // 제조사 매핑
    const manufacturers = await manufacturersCol.find({}).toArray();
    const manufacturerMap: any = {};
    manufacturers.forEach((m: any) => manufacturerMap[m._id.toString()] = m.name);

    // 차량 로딩
    const vehicles = await vehiclesCol.find({}).toArray();
    console.log(`🔍 총 ${vehicles.length}대의 차량 데이터를 처리합니다.`);

    let successCount = 0;

    for (const car of vehicles as any[]) {
      let makerName = 'Unknown Brand';
      if (car.manufacturer_id) {
          makerName = manufacturerMap[car.manufacturer_id.toString()] || '기타 제조사';
      }

      // ---------------------------------------------------------
      // 🧠 [핵심] AI에게 3가지 정보를 한 번에 물어보기
      // ---------------------------------------------------------
      process.stdout.write(`⏳ 분석 중: ${car.name}... `);
      
      // AI 분류 함수 (내부 정의)
      const aiInfo = await analyzeCarWithAI(chatService, car.name);
      
      console.log(`-> 🏷️  [${aiInfo.type}] / [${aiInfo.size}] / [${aiInfo.fuel}]`);

      // 트림 찾기
      let trims = await trimsCol.find({ vehicle_id: car._id }).toArray();
      if (trims.length === 0) trims = await trimsCol.find({ vehicle_id: car._id.toString() }).toArray();

      if (trims.length === 0) {
        console.log('   ↳ ⚠️ 트림 정보 없음 (Skip)');
        continue;
      }

      // 옵션 찾기
      let options = await optionsCol.find({ vehicle_id: car._id }).limit(10).toArray();
      const optionNames = options.map((o: any) => o.name).join(', ');
      const optionText = optionNames ? `주요 옵션: ${optionNames}` : '옵션 정보 없음';

      // 가격 포맷팅
      const prices = trims.map((t: any) => t.base_price).filter((p: any) => typeof p === 'number');
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      const formatPrice = (priceVal: number) => {
          if (!priceVal) return '가격 미정';
          return Math.round(priceVal / 10000).toLocaleString() + '만원';
      };

      const trimInfo = trims.map((t: any) => `- ${t.name}: ${formatPrice(t.base_price)}`).join('\n');
      const imageUrl = car.image_url || car.images?.[0] || '';

      // ---------------------------------------------------------
      // 최종 지식 생성 (AI가 분석한 정확한 정보 사용)
      // ---------------------------------------------------------
      const finalKnowledge = `
        [차량 정보]
        브랜드: ${makerName}
        모델명: ${car.name} (Model Year: ${car.model_year || '최신'})
        
        [상세 분류]
        - 차종(형태): ${aiInfo.type} (예: 세단, SUV, 트럭)
        - 차급(크기): ${aiInfo.size} (예: 경차, 소형, 준중형, 중형, 대형)
        - 연료 타입: ${aiInfo.fuel} (예: 전기, 하이브리드, 가솔린, 디젤, 수소)
        
        [가격 및 옵션]
        가격 범위: ${formatPrice(minPrice)} ~ ${formatPrice(maxPrice)}
        이미지URL: ${imageUrl}
        
        [트림별 가격표]
        ${trimInfo}
        
        [옵션 및 상세]
        ${optionText}
        설명: ${car.description || ''}
      `.trim();

      const source = `car-${car._id}`;
      await chatService.addKnowledge(finalKnowledge, source);
      successCount++;
    }

    console.log(`🎉 총 ${successCount}대의 차량 정보 AI 정밀 분석 및 주입 완료!`);

  } catch (error) {
    console.error('❌ 에러 발생:', error);
  } finally {
    await client.close();
    await app.close();
  }
}

// 🧠 AI 분석 도우미 함수
async function analyzeCarWithAI(chatService: any, modelName: string) {
    // Bedrock 클라이언트에 접근하기 위해 any 타입 사용 (private 속성 우회)
    const client = chatService['bedrockClient']; 
    
    const prompt = `
    자동차 모델명: "${modelName}"
    
    위 자동차에 대해 다음 3가지를 분석해서 " | " 로 구분하여 단답형으로 출력해.
    1. 차종 (선택: 세단, SUV, 트럭, 승합차, 경차, 스포츠카, 해치백)
    2. 차급 (선택: 경차, 소형, 준중형, 중형, 준대형, 대형)
    3. 연료 (이름에 EV/Electric이 있으면 '전기', Hybrid면 '하이브리드', 그 외는 '가솔린' 또는 '디젤'로 추론)

    출력 예시 1: SUV | 중형 | 하이브리드
    출력 예시 2: 세단 | 대형 | 가솔린
    출력 예시 3: 트럭 | 소형 | 디젤
    
    설명하지 말고 오직 "차종 | 차급 | 연료" 형식으로만 답해.
    `;

    const input: ConverseCommandInput = {
      modelId: 'us.meta.llama3-3-70b-instruct-v1:0',
      messages: [{ role: 'user', content: [{ text: prompt }] }],
      inferenceConfig: { maxTokens: 20, temperature: 0 },
    };

    try {
      const command = new ConverseCommand(input);
      const response = await client.send(command);
      const text = response.output?.message?.content?.[0]?.text?.trim() || '';
      const parts = text.split('|').map((s: string) => s.trim());
      
      return {
          type: parts[0] || '기타',
          size: parts[1] || '정보없음',
          fuel: parts[2] || '정보없음'
      };
    } catch (e) {
      return { type: '기타', size: '정보없음', fuel: '정보없음' };
    }
}

bootstrap();
