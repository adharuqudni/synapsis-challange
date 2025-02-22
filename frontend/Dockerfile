# === Stage 1: Install dependencies ===
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

RUN corepack enable && npm install --frozen-lockfile

COPY . .

RUN npm run build

# === Stage 2: Create minimal production image ===
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "run", "start"]
