# 1. 빌드 단계 (Node 20)
FROM node:20-alpine AS builder
ARG APP_NAME

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g @nestjs/cli

COPY . .

# 👇👇👇 [핵심 수정: 심볼릭 링크 및 타입 설치] 👇👇👇
# 1. 각 앱이 상위 node_modules를 찾도록 심볼릭 링크를 생성합니다.
#    (Cannot find module '@nestjs/config' 해결)
RUN ln -s /app/node_modules /app/${APP_NAME}/node_modules
# 2. 전역에서 TS 기본 타입(@types/node)을 찾도록 강제 설치합니다.
#    (Cannot find name 'Buffer', 'process' 에러 해결)
RUN npm install -g @types/node

# 앱 폴더로 이동 후 빌드
RUN cd ${APP_NAME} && nest build

# 2. 실행 단계
FROM node:20-alpine
ARG APP_NAME

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/dist/apps/${APP_NAME} ./dist

EXPOSE 3000-4000
CMD ["node", "dist/main"]
