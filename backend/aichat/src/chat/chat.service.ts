import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConverseCommandInput
} from '@aws-sdk/client-bedrock-runtime';
import { BedrockEmbeddings } from '@langchain/aws';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { Document } from '@langchain/core/documents';
import * as fs from 'fs';

@Injectable()
export class ChatService implements OnModuleInit {
  private embeddings: BedrockEmbeddings;
  private vectorStore: FaissStore;
  private bedrockClient: BedrockRuntimeClient;
  private readonly VECTOR_STORE_PATH = './vector_store';

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID') ?? '';
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY') ?? '';
    const region = this.configService.get<string>('AWS_REGION') ?? 'us-east-1';

    // 1. 임베딩 모델 (LangChain)
    this.embeddings = new BedrockEmbeddings({
      region: region,
      credentials: { accessKeyId, secretAccessKey },
      model: 'amazon.titan-embed-text-v2:0',
    });

    // 2. Bedrock SDK Client (Converse API용)
    this.bedrockClient = new BedrockRuntimeClient({
      region: region,
      credentials: { accessKeyId, secretAccessKey },
    });

    await this.loadVectorStore();
  }

  private async loadVectorStore() {
    if (fs.existsSync(this.VECTOR_STORE_PATH)) {
      console.log('📂 Loading existing vector store...');
      this.vectorStore = await FaissStore.load(this.VECTOR_STORE_PATH, this.embeddings);
    } else {
      console.log('🆕 Creating new vector store...');
      this.vectorStore = await FaissStore.fromDocuments(
        [new Document({ pageContent: 'Init Data', metadata: { source: 'init' } })],
        this.embeddings
      );
      await this.vectorStore.save(this.VECTOR_STORE_PATH);
    }
  }

  async addKnowledge(content: string, source: string) {
    const doc = new Document({ pageContent: content, metadata: { source } });
    await this.vectorStore.addDocuments([doc]);
    await this.vectorStore.save(this.VECTOR_STORE_PATH);
    return { message: 'Knowledge added.', source };
  }

  // AI 차종 분류
  async classifyCar(modelName: string): Promise<string> {
    const prompt = `Classify '${modelName}' into ONE: [Sedan, SUV, Truck, Van, Light Car, Sports Car, Hatchback]. No explanation.`;
    const input: ConverseCommandInput = {
      modelId: 'us.meta.llama3-3-70b-instruct-v1:0',
      messages: [{ role: 'user', content: [{ text: prompt }] }],
      inferenceConfig: { maxTokens: 10, temperature: 0 },
    };
    try {
      const command = new ConverseCommand(input);
      const res = await this.bedrockClient.send(command);
      return res.output?.message?.content?.[0]?.text?.trim().split(/[\n,.]/)[0].trim() || '기타';
    } catch (e) { return '기타'; }
  }

  async chat(userMessage: string) {
    // 1. RAG 검색 (7개)
    // [수정] const -> let으로 변경하여 정렬 결과 재할당 가능하게 함
    let results = await this.vectorStore.similaritySearch(userMessage, 10);

    // [수정 포인트] 검색 결과 재정렬 로직 추가
    // 목적: "프리미엄" 검색 시 "프리미엄 2WD" 같은 하위/긴 이름보다 기본 이름을 우선순위로 둠
    results = results.sort((a, b) => {
        // 텍스트 길이(length)가 짧은 순서대로 정렬 (짧을수록 상위/기본 개념일 확률 높음)
        return a.pageContent.length - b.pageContent.length;
    });

    const context = results.map((r) => r.pageContent).join('\n\n');
    const sources = results.map((r) => r.metadata.source);

    console.log(`🔎 Context Length: ${context.length} characters`);

    // 2. 시스템 프롬프트 (대화 유도 + 스마트 링크 + URL 텍스트 출력 금지)
    const systemPrompt = `
    You are the AI Automotive Specialist for 'AlphaCar'.

    [CORE RULES - STRICT COMPLIANCE]
    1. **LANGUAGE**: Answer strictly in **Korean (Hangul)**. No Hanja.
    2. **GROUNDING**: Answer SOLELY based on the provided [Context].
    3. **GUARDRAIL**: If the user asks about Non-Automotive topics, REJECT immediately.

    [CONVERSATION FLOW - KEEP IT ALIVE]
    **Do NOT just answer and stop.** Always end your response with a **Follow-up Question** to guide the user.

    - **If you recommended cars**: "이 중에서 마음에 드는 모델이 있으신가요? 아니면 다른 조건(예: 연비, 디자인)으로 더 찾아볼까요?"
    - **If you gave a price**: "생각하신 예산 범위에 맞으신가요? 할부 견적이나 옵션 정보도 알려드릴까요?"
    - **If info is missing**: "더 정확한 추천을 위해 선호하시는 브랜드나 연료 타입(전기/가솔린)을 알려주시겠어요?"
    - **General**: Act like a friendly and proactive car dealer.

    [RESPONSE STRATEGY]
    1. **QUANTITY**: Recommend at least 3 different models if possible.
    2. **FORMAT**: Use a numbered list.

    [SMART FILTERING LOGIC]
    1. **Price Flexibility**: Allow ±10% margin.
    2. **Type Filtering**:
       - "Sedan" -> Sedan/Coupe/Hatchback.
       - "SUV" -> SUV/RV.
    3. **Scenarios**:
       - "Camping": SUV, Van.
       - "Commute/First Car": Compact Sedan, Hybrid, Light Car.

    [IMAGE RENDERING & LINKING LOGIC]
    - MUST display images if 'ImageURL' exists in context.
    - **CRITICAL**: You MUST wrap the image in a link to the quote page.

    - **⛔ STRICT RULE (NO RAW URLs)**:
      - Do NOT write the raw Image URL (http://...) as plain text in the response.
      - ONLY output the URL inside the Markdown link syntax.
      - (Bad Example): "여기 이미지입니다: https://example.com/car.jpg [![Car](...)]..."
      - (Good Example): "여기 이미지입니다: [![Car](...)]..."

    - **ID Selection Rules (Smart Linking)**:
      1. Check the **[트림별 상세 정보 (ID 포함)]** section in the context.
      2. **IF** the user mentioned a specific trim name (e.g., "Prestige", "Exclusive", "Noblesse"):
         - Find the ID associated with that trim name in the list.
         - Use that specific ID.
      3. **IF** the user did NOT specify a trim (General inquiry):
         - Use the ID of the **first (lowest price)** trim in the list.
         - Or use 'BaseTrimId' if available.

    - **Link Format**:
      [![Car Name](ImageURL)](/quote/personal/result?trimId={Selected_TrimId})

    - Keep 'ImageURL' exactly as provided in the context. Do not modify the image url.

    [Context]
    ${context}
    `;

    // 3. Bedrock Converse API
    const guardrailId = this.configService.get<string>('BEDROCK_GUARDRAIL_ID');
    const guardrailVersion = this.configService.get<string>('BEDROCK_GUARDRAIL_VERSION') || 'DRAFT';

    const input: ConverseCommandInput = {
      modelId: 'us.meta.llama3-3-70b-instruct-v1:0',
      messages: [{ role: 'user', content: [{ text: userMessage }] }],
      system: [{ text: systemPrompt }],
      inferenceConfig: { maxTokens: 2048, temperature: 0.2 },
    };

    if (guardrailId && guardrailId.length > 5) {
        input.guardrailConfig = {
            guardrailIdentifier: guardrailId,
            guardrailVersion: guardrailVersion,
            trace: 'enabled',
        };
        console.log(`🛡️ Guardrail Active: ${guardrailId} (${guardrailVersion})`);
    }

    try {
      const command = new ConverseCommand(input);
      const response = await this.bedrockClient.send(command);

      if (response.stopReason === 'guardrail_intervened') {
          console.log("🚫 Blocked by AWS Guardrail!");
          return {
              response: "🚫 [자동 차단] 자동차와 관련 없는 질문(금융, 정치, 욕설 등)은 답변할 수 없습니다.",
              context_used: [],
          };
      }

      const outputText = response.output?.message?.content?.[0]?.text || '';
      return { response: outputText, context_used: sources };

    } catch (e: any) {
      console.error("🔥 AWS Bedrock Error:", e.message);
      if (e.name === 'ValidationException' && e.message.includes('guardrail')) {
         return {
             response: `⚠️ [System Error] Guardrail Config Error.\n${e.message}`,
             context_used: []
         };
      }
      return {
          response: "죄송합니다. AI 서버 오류가 발생했습니다.",
          context_used: []
      };
    }
  }
}
