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

  // [기존 유지] AI 텍스트 기반 차종 분류 (Llama 3.3 70B)
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

  // =================================================================================
  // [신규 기능] 이미지 채팅 (Llama 3.2 Vision 적용)
  // =================================================================================

  async chatWithImage(imageBuffer: Buffer, mimeType: string = 'image/jpeg') {
    console.log("📸 Image received, analyzing with Llama 3.2 Vision...");

    const carModelName = await this.identifyCarWithLlama(imageBuffer, mimeType);

    if (carModelName === 'NOT_CAR') {
        return {
            response: "죄송합니다. 사진에서 자동차를 명확하게 식별하지 못했습니다. 차량이 잘 보이는 사진으로 다시 시도해 주세요.",
            context_used: [],
            identified_car: null
        };
    }

    console.log(`📸 Identified Car: ${carModelName}`);

    const userPrompt = `${carModelName} 모델의 가격과 주요 특징에 대해 상세히 알려줘.`;

    const chatResult = await this.chat(userPrompt);

    return {
        ...chatResult,
        identified_car: carModelName
    };
  }

  private async identifyCarWithLlama(imageBuffer: Buffer, mimeType: string): Promise<string> {
    const modelId = 'us.meta.llama3-2-90b-instruct-v1:0';

    const prompt = `
    이미지에 있는 차량을 보고 다음 세 가지 지침에 따라 응답해.
    1. 이미지 속 자동차의 제조사명과 **정확한 모델명**(예: "현대 그랜저", "기아 쏘렌토", "제네시스 G80")을 식별해.
    2. **응답은 오직** 식별된 모델명 **하나**만 **한국어(한글)**로 출력해. 다른 설명이나 문장은 **절대** 포함하지 마.
    3. 이미지에 자동차가 없거나 식별할 수 없다면, **오직** "**NOT_CAR**"라는 텍스트만 출력해.
    `;

    const format = mimeType === 'image/png' ? 'png' :
                   mimeType === 'image/webp' ? 'webp' :
                   mimeType === 'image/gif' ? 'gif' : 'jpeg';

    const input: ConverseCommandInput = {
      modelId: modelId,
      messages: [
        {
          role: 'user',
          content: [
            {
              image: {
                format: format,
                source: {
                  bytes: imageBuffer,
                },
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      inferenceConfig: { maxTokens: 100, temperature: 0.1 },
    };

    try {
      const command = new ConverseCommand(input);
      const response = await this.bedrockClient.send(command);

      let text = response.output?.message?.content?.[0]?.text?.trim() || 'NOT_CAR';

      text = text.replace(/\.$/, '').trim();

      if (text.includes('NOT_CAR')) return 'NOT_CAR';

      return text;
    } catch (e) {
      console.error("🔥 Bedrock Vision Error:", e);
      return 'NOT_CAR';
    }
  }

  // =================================================================================

  async chat(userMessage: string) {
    // 1. RAG 검색 
    // 검색량을 50개로 유지합니다.
    let results = await this.vectorStore.similaritySearch(userMessage, 50); 

    const context = results.map((r) => r.pageContent).join('\n\n');
    const sources = results.map((r) => r.metadata.source);

    console.log(`🔎 Context Length: ${context.length} characters`);

    // 👇 [FIX: 비교 모드 감지 로직] 사용자가 비교를 원하는지 감지합니다.
    const comparisonKeywords = ['비교', '대비', '뭐가 더', '차이'];
    const isComparisonQuery = comparisonKeywords.some(keyword => userMessage.includes(keyword)) && 
                              (userMessage.includes('쏘나타') && userMessage.includes('K5'));

    // 2. 시스템 프롬프트 (링크 ID 치환 로직 강화 및 이미지 출력 강제)
    let systemPrompt = `
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

    [RESPONSE_STRATEGY]
    1. **QUANTITY**: Recommend at least 3 different models if possible.
    2. **FORMAT**: Use a numbered list.
    
    // 👇 [최종 FIX] 비교 쿼리일 경우, 구조화된 블록 출력을 강제하여 정보 누락을 막습니다.
    ${isComparisonQuery ? `
    3. **COMPARISON_RULE (CRITICAL)**: The user wants a side-by-side comparison. YOU MUST NOT fail to find either model. Search the Context for both "쏘나타" and "K5". Your entire response MUST output two distinct, separate content blocks (one for Sonata, one for K5) separated only by TWO consecutive newlines (\\n\\n). 
    4. **BLOCK_STRUCTURE**: Each block MUST start with the image link for the model it describes, followed immediately by a short summary of its Price Range and Key Options text. DO NOT output a comparison table. DO NOT output the block numbers (1, 2).
    ` : `
    3. **IMAGE_PRIORITY**: If the context provides the ImageURL and BaseTrimId for the car you are discussing, you MUST include its image and link following the [IMAGE RENDERING & LINKING LOGIC].
    `}

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
      
    - **ID Selection Rules (Smart Linking)**:
      1. Find the **BaseTrimId** value from the [시스템 데이터] section of the vehicle you are describing.
      2. **ABSOLUTELY MUST**: The resulting link MUST use the actual ID value, not a placeholder.
      
    - **Link Format (Template - MUST FOLLOW)**:
      [![Car Model Name](ImageURL)](/quote/personal/result?trimId=실제_BaseTrimId_값)

    [Context]
    ${context}
    `;

    // 3. Bedrock Converse API (Llama 3.3 70B - 텍스트 생성용)
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
