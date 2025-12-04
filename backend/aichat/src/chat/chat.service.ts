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
    
    this.embeddings = new BedrockEmbeddings({
      region: region,
      credentials: { accessKeyId, secretAccessKey },
      model: 'amazon.titan-embed-text-v2:0',
    });

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
    // 🚀 [수정 1] 검색 범위 확장 (10개 -> 20개)
    // 다양한 차종을 확보하기 위해 더 많이 가져옵니다.
    const results = await this.vectorStore.similaritySearch(userMessage, 20);
    const context = results.map((r) => r.pageContent).join('\n\n');
    const sources = results.map((r) => r.metadata.source);

    console.log(`🔎 Context Length: ${context.length} characters from ${results.length} chunks`);

    // 🚀 [수정 2] 프롬프트 강화: "여러 개 추천해라(Diversity)" 명령 추가
    const systemPrompt = `
    You are the AI Automotive Specialist for 'AlphaCar'.
    
    [CORE RULES - STRICT COMPLIANCE]
    1. **LANGUAGE**: Answer strictly in **Korean (Hangul)**. 
       - **ABSOLUTELY NO HANJA**: Convert ALL Chinese characters to Korean pronunciation.
       - **Examples**: 
         - "搭載" -> "탑재"
         - "最高" -> "최고"
         - "價格" -> "가격"
    2. **GROUNDING**: Answer SOLELY based on the provided [Context].
    3. **GUARDRAIL**: If the user asks about Non-Automotive topics (Bitcoin, Crime, Stock, Politics, etc.), REJECT immediately with: "죄송합니다. 저는 자동차 관련 질문에만 답변할 수 있습니다."

    [RESPONSE STRATEGY - IMPORTANT]
    1. **QUANTITY**: If multiple cars match the criteria in the [Context], **YOU MUST RECOMMEND AT LEAST 3 DIFFERENT MODELS**.
       - Do NOT stop after one recommendation.
       - If there are 5 matching cars, show all 5.
    2. **DIVERSITY**: Prioritize listing **different models** (e.g., Sonata, K5, SM6) rather than multiple trims of the same car.
    3. **FORMAT**: Use a numbered list for clear comparison.

    [SMART FILTERING LOGIC]
    Analyze user intent and filter the [Context]:
    1. **Price Flexibility**: Allow ±10% margin. (e.g., "4000만원 대" -> Include 3500~4900만원 cars).
    2. **Type Filtering**: 
       - "Sedan" -> Recommend Sedan/Coupe/Hatchback. Exclude SUV/Truck.
       - "SUV" -> Recommend SUV/RV.
    3. **Scenarios**:
       - "Camping": SUV, Van.
       - "Commute/First Car": Compact Sedan, Hybrid, Light Car.

    [IMAGE RENDERING]
    - MUST display images if 'ImageURL' exists in context.
    - Format: ![Car Name](URL)
    - Keep URL exactly as is.

    [Context]
    ${context}
    `;

    const guardrailId = this.configService.get<string>('BEDROCK_GUARDRAIL_ID');
    const guardrailVersion = this.configService.get<string>('BEDROCK_GUARDRAIL_VERSION') || 'DRAFT';

    const input: ConverseCommandInput = {
      modelId: 'us.meta.llama3-3-70b-instruct-v1:0',
      messages: [{ role: 'user', content: [{ text: userMessage }] }],
      system: [{ text: systemPrompt }],
      inferenceConfig: { maxTokens: 2048, temperature: 0.2 }, // 온도를 살짝 높여서(0.1 -> 0.2) 다양성 유도
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

      // Guardrail Block Check
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
             response: `⚠️ [System Error] Guardrail Config Error.\nCheck .env ID/VERSION.\n${e.message}`,
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
