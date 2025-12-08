# 1. 빌드 단계
FROM node:18-alpine AS builder
ARG APP_NAME # 젠킨스가 넣어줄 앱 이름

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# 선택된 앱만 빌드
RUN npm nest build ${APP_NAME}

# 2. 실행 단계
FROM node:18-alpine
ARG APP_NAME

WORKDIR /app
COPY package*.json ./
RUN npm install --production

# 빌드된 결과물 중 '선택된 앱'의 dist 폴더만 가져오기
COPY --from=builder /app/dist/apps/${APP_NAME} ./dist

EXPOSE 3000-4000
CMD ["node", "dist/main"]
