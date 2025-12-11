# ---------------------------------------------------
# 1. 빌드 단계 (Builder) - 모든 도구 포함
# ---------------------------------------------------
FROM node:20-alpine AS builder
ARG APP_NAME

WORKDIR /app

# 1-1. 알파인 리눅스 필수 패키지 (NestJS/Node 호환성)
RUN apk add --no-cache libc6-compat

# 1-2. 패키지 파일 복사
COPY package.json package-lock.json ./
COPY ${APP_NAME}/package.json ${APP_NAME}/

# 1-3. 개발 의존성 포함 전체 설치 (빌드에 필요)
RUN npm install -g @nestjs/cli
RUN npm ci --legacy-peer-deps

# 1-4. 소스 코드 복사 및 빌드
COPY . .
RUN [ -d "schemas" ] && cp -r schemas ${APP_NAME}/src/ || true
RUN cd ${APP_NAME} && npm ci --legacy-peer-deps || npm install --legacy-peer-deps || true
RUN cd ${APP_NAME} && nest build

# 1-5. Production 의존성만 별도 설치 (prune 대신 안정적인 방법 - 레이어 충돌 방지)
WORKDIR /app
RUN mkdir -p prod-deps prod-deps/${APP_NAME} && \
    cp package.json package-lock.json prod-deps/ && \
    cp ${APP_NAME}/package.json prod-deps/${APP_NAME}/ && \
    (cp ${APP_NAME}/package-lock.json prod-deps/${APP_NAME}/ 2>/dev/null || true)

WORKDIR /app/prod-deps
RUN npm ci --omit=dev --legacy-peer-deps

WORKDIR /app/prod-deps/${APP_NAME}
RUN if [ -f package-lock.json ]; then \
        npm ci --omit=dev --legacy-peer-deps || npm install --omit=dev --legacy-peer-deps || true; \
    else \
        npm install --omit=dev --legacy-peer-deps --package-lock-only || npm install --omit=dev --legacy-peer-deps || true; \
    fi

# ---------------------------------------------------
# 2. 실행 단계 (Runner) - 초경량화 (Production 의존성만)
# ---------------------------------------------------
FROM node:20-alpine AS runner
ARG APP_NAME

WORKDIR /app
ENV NODE_ENV=production

# 2-1. Production 의존성만 복사 (이미 정리된 상태)
COPY --from=builder /app/prod-deps/node_modules ./node_modules
# 서비스별 node_modules 복사 (빌드 단계에서 생성됨)
RUN mkdir -p ${APP_NAME}
COPY --from=builder /app/prod-deps/${APP_NAME}/node_modules ./${APP_NAME}/node_modules

# 2-2. 실행 파일(dist)과 설정 파일(package.json) 복사
COPY --from=builder /app/${APP_NAME}/dist ./${APP_NAME}/dist
COPY --from=builder /app/${APP_NAME}/package.json ./${APP_NAME}/package.json

# 2-3. 실행
EXPOSE 3000-4000
CMD ["sh", "-c", "node $(find . -name main.js | head -n 1)"]
