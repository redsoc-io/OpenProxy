FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/src ./src
COPY --from=frontend-build /app/../backend/public ./public

EXPOSE 3000

CMD ["node", "--expose-gc", "src/index.js"]
